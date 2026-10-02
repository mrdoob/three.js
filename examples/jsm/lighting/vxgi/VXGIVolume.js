import { Box3, Vector3, Vector4, Matrix4, Layers, Storage3DTexture, StorageBufferAttribute, StorageTexture3DNode, CubeTextureNode, RendererUtils, HalfFloatType, UnsignedByteType, RGBAFormat, LinearFilter, LinearMipmapLinearFilter, ClampToEdgeWrapping, MathUtils } from 'three/webgpu';
import { Fn, If, Loop, nodeObject, uniform, uniformArray, storage, instanceIndex, textureStore, texture3D, texture, float, int, uint, vec2, vec3, vec4, ivec3, uvec3, max, min, abs, dot, cross, normalize, floor, sign, select, countOneBits, atomicOr, smoothstep, hash, fract, sqrt, cos, sin, length, PI, getDistanceAttenuation, viewZToPerspectiveDepth, viewZToReversedPerspectiveDepth } from 'three/tsl';

import { collectSceneTriangles, computeSceneBounds, TRIANGLE_STRIDE } from './VXGISceneCollector.js';
import { createConeTracer } from './VXGIConeTracer.js';

const _box = /*@__PURE__*/ new Box3();
const _size = /*@__PURE__*/ new Vector3();
const _position = /*@__PURE__*/ new Vector3();
const _target = /*@__PURE__*/ new Vector3();

const MAX_EDGE_SUBVOXELS = 16;
const BOUNCE_CONE_COUNT = 8;

// the six directions a ray can travel, as (axis, sign) pairs

const DIRECTIONS = [[ 0, 1 ], [ 0, - 1 ], [ 1, 1 ], [ 1, - 1 ], [ 2, 1 ], [ 2, - 1 ]];

let _rendererState;

/**
 * Storage texture node bound to a single mip level. Texture nodes normally share one binding
 * per texture; this node keys the binding by access and mip level so a kernel can read one
 * level while writing another.
 *
 * @private
 */
class MipStorageTexture3DNode extends StorageTexture3DNode {

	constructor( value, access, mipLevel ) {

		super( value, null, null );

		this.setAccess( access );
		this.setMipLevel( mipLevel );

	}

	getUniformHash() {

		return `${ this.value.uuid }:${ this.access }:${ this.mipLevel }`;

	}

}

/**
 * Cube texture node without the material's environment rotation, which requires a material and
 * scene context that compute passes lack. Used for point light shadow maps.
 *
 * @private
 */
class PlainCubeTextureNode extends CubeTextureNode {

	setupUV( builder, uvNode ) {

		if ( this.value.isDepthTexture === true ) {

			return vec3( uvNode.x, uvNode.y.negate(), uvNode.z );

		}

		return vec3( uvNode.x.negate(), uvNode.yz );

	}

}

/**
 * Holds the voxel representation of a scene for {@link VXGINode}: an anisotropic opacity
 * mip chain, a direct radiance volume and a radiance volume with cached bounces.
 *
 * The representation is a dense variant of the pre-filtered voxel hierarchy of Crassin et al. 2011
 * (a dense mip chain instead of a sparse octree, which keeps cone samples to two texture fetches):
 * opacity stores visibility per major axis and is filtered directionally (volumetric integration
 * along the axis, averaging across it), radiance is stored opacity-premultiplied and indirect bounces
 * are cached in the volume via cone tracing. Only direct lights are injected.
 * Voxelization uses conservative rasterization along the dominant triangle axis in a compute shader.
 *
 * Direct light is injected per voxel instead of splatting photons from a light-view map as in the
 * paper: the shadow maps rendered by the renderer are the light-view maps, and every occupied voxel
 * pulls its visibility from them (2D maps for directional and spot lights, cube maps for point
 * lights) and evaluates its irradiance analytically. This reuses the existing shadow passes, makes
 * the injected shadows match the direct lighting exactly and needs neither atomics nor a
 * normalization by photon density. Lights without a shadow map fall back to a visibility cone
 * traced through the volume. The trade-off is a cost proportional to the number of occupied voxels
 * times lights rather than to the light-view resolution, and that only outgoing diffuse radiance
 * is stored (no incoming direction distribution for glossy cones).
 *
 * References:
 * - {@link https://research.nvidia.com/publication/2011-09_interactive-indirect-illumination-using-voxel-cone-tracing}:
 *   Crassin et al., Interactive Indirect Illumination Using Voxel Cone Tracing, Pacific Graphics 2011.
 * - {@link https://developer.nvidia.com/content/basics-gpu-voxelization}: Basics of GPU voxelization.
 *
 * Note: This class can only be used with `WebGPURenderer` and a WebGPU backend.
 *
 * @three_import import { VXGIVolume } from 'three/addons/lighting/vxgi/VXGIVolume.js';
 */
class VXGIVolume {

	/**
	 * Constructs a new volume.
	 *
	 * @param {number} [resolution=128] - Number of voxels along the longest axis of the bounds. Should not exceed `256`, higher values exceed the maximum storage buffer size of the voxelizer.
	 */
	constructor( resolution = 128 ) {

		/**
		 * Number of voxels along the longest axis of the bounds. Should not exceed `256`, higher values exceed the maximum storage buffer size of the voxelizer.
		 *
		 * @type {number}
		 * @default 128
		 */
		this.resolution = resolution;

		/**
		 * The requested world-space bounds of the volume. If empty (the default), the bounds are
		 * computed from the scene at voxelization. See {@link VXGIVolume#worldBounds} for the
		 * effective bounds.
		 *
		 * @type {Box3}
		 */
		this.bounds = new Box3();

		/**
		 * The effective world-space bounds of the voxel grid, updated at voxelization.
		 *
		 * @type {Box3}
		 * @readonly
		 */
		this.worldBounds = new Box3();

		/**
		 * Only meshes that pass this layer test are voxelized.
		 *
		 * @type {Layers}
		 */
		this.layers = new Layers();

		/**
		 * Number of cached indirect bounces stored in the volume. Should be in the range `[0, 2]`.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.bounces = 1;

		/**
		 * Triangles with a lower opacity are not voxelized.
		 *
		 * @type {number}
		 * @default 0.1
		 */
		this.minOpacity = 0.1;

		/**
		 * Whether the coarser radiance levels are filtered directionally: along each axis the finer
		 * voxels are composited front to back using their surface normals, so a cone only gathers
		 * the surfaces facing it. This reduces light bleeding through thin walls and floors (e.g. a
		 * sunlit floor brightening the ceiling of the room below) at the cost of additional memory
		 * and a more expensive radiance lookup. Changing it triggers a re-voxelization.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.directionalRadiance = false;

		/**
		 * Maximum number of lights injected into the volume.
		 *
		 * @type {number}
		 * @default 8
		 */
		this.maxLights = 8;

		/**
		 * Set to `true` to re-voxelize the scene in the next update.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.needsUpdate = true;

		/**
		 * Set to `true` to re-inject lighting in the next update. Changes of the lights and of the
		 * injection parameters are detected automatically, so this is rarely needed.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.lightingNeedsUpdate = true;

		/**
		 * Maximum cone length in world units. `0` means unbounded.
		 *
		 * @type {UniformNode<float>}
		 * @default 0
		 */
		this.maxDistance = uniform( 0 );

		/**
		 * Step size relative to the texel size of the sampled mip level.
		 *
		 * @type {UniformNode<float>}
		 * @default 0.5
		 */
		this.stepScale = uniform( 0.5 );

		/**
		 * Aperture in degrees of the visibility cones traced towards lights that do not provide a
		 * shadow map. Wider cones are cheaper but soften the injected shadows.
		 *
		 * @type {UniformNode<float>}
		 * @default 10
		 */
		this.shadowConeAngle = uniform( 10 );

		/**
		 * Aperture of the cones used for the cached bounces in degrees.
		 *
		 * @type {UniformNode<float>}
		 * @default 60
		 */
		this.bounceConeAngle = uniform( 60 );

		/**
		 * The minimum corner of the volume.
		 *
		 * @type {UniformNode<vec3>}
		 */
		this.boundsMinNode = uniform( new Vector3() );

		/**
		 * The size of the volume.
		 *
		 * @type {UniformNode<vec3>}
		 */
		this.volumeSizeNode = uniform( new Vector3( 1, 1, 1 ) );

		/**
		 * The size of a voxel.
		 *
		 * @type {UniformNode<float>}
		 */
		this.voxelSizeNode = uniform( 1 );

		/**
		 * The highest valid mip level of the voxel textures.
		 *
		 * @type {UniformNode<float>}
		 */
		this.maxLevelNode = uniform( 0 );

		/**
		 * The per-axis opacity of the scene (`xyz`) and the occupancy (`w`) as a mip chain.
		 *
		 * @type {Storage3DTexture}
		 */
		this.opacityTexture = this._createTexture( 'VXGI.Opacity', UnsignedByteType, true, 1, 1, 1 );

		/**
		 * The radiance of the scene including cached bounces, premultiplied by occupancy, as a mip chain.
		 * With {@link VXGIVolume#directionalRadiance} only the finest level is used and the coarser
		 * levels live in {@link VXGIVolume#directionalTexture}.
		 *
		 * @type {Storage3DTexture}
		 */
		this.radianceTexture = this._createTexture( 'VXGI.Radiance', HalfFloatType, true, 1, 1, 1 );

		/**
		 * Texture node of {@link VXGIVolume#opacityTexture}. Stays valid across re-allocations of the volume.
		 *
		 * @type {Texture3DNode}
		 */
		this.opacityNode = texture3D( this.opacityTexture );

		/**
		 * Texture node of {@link VXGIVolume#radianceTexture}. Stays valid across re-allocations of the volume.
		 *
		 * @type {Texture3DNode}
		 */
		this.radianceNode = texture3D( this.radianceTexture );

		/**
		 * The coarser radiance levels filtered directionally for the six directions a ray can travel
		 * (+x, -x, +y, -y, +z, -z), only allocated with {@link VXGIVolume#directionalRadiance}. Each
		 * texel holds the radiance of the surfaces facing the direction premultiplied by their weight
		 * (`rgb`) and the weight (`a`); occlusion comes from the opacity mip chain. The six directions
		 * are stored side by side along x in one half-resolution mip chain; level `n` of the volume is
		 * its level `n - 1`.
		 *
		 * @type {Storage3DTexture}
		 */
		this.directionalTexture = this._createTexture( 'VXGI.Directional', HalfFloatType, true, 6, 1, 1 );

		/**
		 * Texture node of {@link VXGIVolume#directionalTexture}. Stays valid across re-allocations of the volume.
		 *
		 * @type {Texture3DNode}
		 */
		this.directionalNode = texture3D( this.directionalTexture );

		/**
		 * The width of one direction block of the directional texture in texels (at its level 0).
		 *
		 * @type {UniformNode<float>}
		 */
		this.directionalWidthNode = uniform( 1 );

		// private

		this._traceDistance = this.maxDistance.greaterThan( 0 ).select( this.maxDistance, float( 1e10 ) );
		this._allocated = false;

		this._gridSize = new Vector3();
		this._levels = 1;
		this._voxelCount = 0;
		this._gridSizeNode = [ uniform( 1, 'uint' ), uniform( 1, 'uint' ), uniform( 1, 'uint' ) ];
		this._voxelCountNode = uniform( 0, 'uint' );

		this._pingPongTexture = null;
		this._directTexture = null;
		this._pingPongDirectionalTexture = null;
		this._normalTexture = null;
		this._directional = false;

		this._occupancyAttribute = null;
		this._triangleIdAttribute = null;
		this._triangleAttribute = null;
		this._trianglesNode = null;
		this._triangleCount = 0;
		this._triangleCountNode = uniform( 0, 'uint' );

		this._kernels = null;

		this._lightsArray = [];
		for ( let i = 0; i < this.maxLights * 4; i ++ ) this._lightsArray.push( new Vector4() );
		this._lightsNode = uniformArray( this._lightsArray, 'vec4' );
		this._lightCountNode = uniform( 0, 'uint' );
		this._lightKey = '';

		// per light slot: type, shadow map (2D depth or cube depth) and its matrix / bias / near / far

		this._lightTypes = [];
		this._lightShadows = [];
		this._shadowMatrices = [];
		this._shadowParams = [];

		for ( let i = 0; i < this.maxLights; i ++ ) {

			this._shadowMatrices.push( uniform( new Matrix4() ) );
			this._shadowParams.push( uniform( new Vector4() ) );

		}

		this._lightsKey = '';


		this._exclude = new Set();

	}

	/**
	 * The effective maximum cone length as a node.
	 *
	 * @type {Node<float>}
	 */
	get traceDistanceNode() {

		return this._traceDistance;

	}

	/**
	 * Updates the volume if required. Voxelizes the scene when `needsUpdate` is set and re-injects
	 * lighting when `lightingNeedsUpdate` is set or a light has changed.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Scene} scene - The scene.
	 */
	update( renderer, scene ) {

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		// the volume might be updated before the scene was rendered for the first time

		if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();

		if ( this.needsUpdate === true || this._allocated === false || this._directional !== this.directionalRadiance ) {

			this._voxelize( renderer, scene );

			this.needsUpdate = false;
			this.lightingNeedsUpdate = true;

		}

		const lightKey = this._collectLights( renderer, scene );

		if ( this.lightingNeedsUpdate === true || lightKey !== this._lightKey ) {

			this._lightKey = lightKey;
			this._updateLighting( renderer );

			this.lightingNeedsUpdate = false;

		}

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		this._disposeGrid();

	}

	// geometry

	_voxelize( renderer, scene ) {

		this._exclude.clear();

		const bounds = this.bounds.isEmpty() ? computeSceneBounds( scene, this.layers, this._exclude, _box ) : _box.copy( this.bounds );

		if ( bounds.isEmpty() ) bounds.min.set( - 1, - 1, - 1 ), bounds.max.set( 1, 1, 1 );

		// grid setup: the longest axis gets `resolution` voxels, all dimensions are padded by
		// one voxel and rounded up so every mip level has integer dimensions

		bounds.getSize( _size );

		const resolution = Math.max( 8, this.resolution );
		const voxelSize = Math.max( _size.x, _size.y, _size.z ) / resolution;
		let levels = MathUtils.clamp( Math.floor( Math.log2( resolution ) ) - 2, 1, 8 );
		const multiple = 2 ** ( levels - 1 );

		const gridSize = _size.clone();
		gridSize.x = Math.ceil( ( Math.ceil( _size.x / voxelSize ) + 2 ) / multiple ) * multiple;
		gridSize.y = Math.ceil( ( Math.ceil( _size.y / voxelSize ) + 2 ) / multiple ) * multiple;
		gridSize.z = Math.ceil( ( Math.ceil( _size.z / voxelSize ) + 2 ) / multiple ) * multiple;

		levels = Math.min( levels, Math.floor( Math.log2( Math.max( gridSize.x, gridSize.y ) ) ) + 1 );

		this.boundsMinNode.value.copy( bounds.min ).subScalar( voxelSize );
		this.volumeSizeNode.value.copy( gridSize ).multiplyScalar( voxelSize );
		this.worldBounds.min.copy( this.boundsMinNode.value );
		this.worldBounds.max.copy( this.boundsMinNode.value ).add( this.volumeSizeNode.value );
		this.voxelSizeNode.value = voxelSize;
		this.maxLevelNode.value = levels - 1;

		if ( gridSize.equals( this._gridSize ) === false || levels !== this._levels || this._directional !== this.directionalRadiance ) {

			this._allocateGrid( gridSize, levels );

		}

		// collect triangles

		_box.min.copy( this.boundsMinNode.value );
		_box.max.copy( this.boundsMinNode.value ).add( this.volumeSizeNode.value );

		const { data, count } = collectSceneTriangles( scene, {
			bounds: _box,
			layers: this.layers,
			exclude: this._exclude,
			subVoxelSize: voxelSize * 0.5,
			maxEdge: MAX_EDGE_SUBVOXELS,
			minOpacity: this.minOpacity
		} );

		this._triangleCount = count;
		this._triangleCountNode.value = count;
		this._triangleAttribute = new StorageBufferAttribute( count > 0 ? data : new Float32Array( TRIANGLE_STRIDE ), 4 );
		this._trianglesNode = storage( this._triangleAttribute, 'vec4', this._triangleAttribute.count ).toReadOnly();

		// kernels depend on the triangle buffer and grid

		this._kernels = null;
		const kernels = this._getKernels();

		renderer.compute( kernels.clear );

		if ( count > 0 ) renderer.compute( kernels.voxelize );

		renderer.compute( kernels.resolve );

		for ( const kernel of kernels.opacityMips ) renderer.compute( kernel );

	}

	_allocateGrid( gridSize, levels ) {

		this._disposeGrid();

		const { x, y, z } = gridSize;

		this._gridSize.copy( gridSize );
		this._levels = levels;
		this._voxelCount = x * y * z;
		this._gridSizeNode[ 0 ].value = x;
		this._gridSizeNode[ 1 ].value = y;
		this._gridSizeNode[ 2 ].value = z;
		this._voxelCountNode.value = this._voxelCount;

		const directional = this._directional = this.directionalRadiance;

		this.opacityTexture = this._createTexture( 'VXGI.Opacity', UnsignedByteType, true, x, y, z );
		this.radianceTexture = this._createTexture( 'VXGI.Radiance', HalfFloatType, directional === false, x, y, z );
		this._pingPongTexture = this._createTexture( 'VXGI.RadiancePingPong', HalfFloatType, directional === false, x, y, z );
		this._directTexture = this._createTexture( 'VXGI.Direct', HalfFloatType, false, x, y, z );

		// the directional levels start at level 1, i.e. at half resolution, six direction blocks along x

		if ( directional === true ) {

			const hx = Math.ceil( x / 2 ), hy = Math.ceil( y / 2 ), hz = Math.ceil( z / 2 );

			this.directionalTexture = this._createTexture( 'VXGI.Directional', HalfFloatType, true, 6 * hx, hy, hz );
			this._pingPongDirectionalTexture = this._createTexture( 'VXGI.DirectionalPingPong', HalfFloatType, true, 6 * hx, hy, hz );
			this._normalTexture = this._createTexture( 'VXGI.Normal', UnsignedByteType, false, x, y, z );
			this.directionalWidthNode.value = hx;

		} else {

			this.directionalTexture = this._createTexture( 'VXGI.Directional', HalfFloatType, true, 6, 1, 1 );
			this.directionalWidthNode.value = 1;

		}

		this.opacityNode.value = this.opacityTexture;
		this.radianceNode.value = this.radianceTexture;
		this.directionalNode.value = this.directionalTexture;

		this._allocated = true;

		this._occupancyAttribute = new StorageBufferAttribute( this._voxelCount, 1, Uint32Array );
		this._triangleIdAttribute = new StorageBufferAttribute( this._voxelCount, 1, Uint32Array );

	}

	_createTexture( name, type, mipmaps, x, y, z ) {

		const texture = new Storage3DTexture( x, y, z );
		texture.name = name;
		texture.type = type;
		texture.format = RGBAFormat;
		texture.generateMipmaps = mipmaps;
		texture.mipmapsAutoUpdate = false;
		texture.minFilter = mipmaps ? LinearMipmapLinearFilter : LinearFilter;
		texture.magFilter = LinearFilter;
		texture.wrapS = texture.wrapT = texture.wrapR = ClampToEdgeWrapping;

		return texture;

	}

	_disposeGrid() {

		this.opacityTexture.dispose();
		this.radianceTexture.dispose();
		this.directionalTexture.dispose();

		if ( this._pingPongTexture !== null ) {

			this._pingPongTexture.dispose();
			this._directTexture.dispose();

			this._pingPongTexture = null;
			this._directTexture = null;

		}

		if ( this._normalTexture !== null ) {

			this._normalTexture.dispose();
			this._pingPongDirectionalTexture.dispose();

			this._normalTexture = null;
			this._pingPongDirectionalTexture = null;

		}

		this._occupancyAttribute = null;
		this._triangleIdAttribute = null;
		this._kernels = null;
		this._allocated = false;

	}

	// lighting

	_collectLights( renderer, scene ) {

		const lights = this._lightsArray;
		let count = 0;
		let key = renderer.shadowMap.enabled ? 'S' : 'N';

		this._lightTypes.length = 0;
		this._lightShadows.length = 0;

		scene.traverseVisible( ( object ) => {

			if ( object.isLight !== true || count >= this.maxLights ) return;

			let type;

			if ( object.isDirectionalLight === true ) type = 0;
			else if ( object.isSpotLight === true ) type = 2;
			else if ( object.isPointLight === true ) type = 1;
			else return;

			const l0 = lights[ count * 4 ], l1 = lights[ count * 4 + 1 ], l2 = lights[ count * 4 + 2 ], l3 = lights[ count * 4 + 3 ];

			_position.setFromMatrixPosition( object.matrixWorld );
			l0.set( _position.x, _position.y, _position.z, type );

			if ( type === 0 || type === 2 ) {

				_target.setFromMatrixPosition( object.target.matrixWorld );

				if ( type === 0 ) {

					_target.subVectors( _position, _target ).normalize(); // direction towards the light

				} else {

					_target.subVectors( _target, _position ).normalize(); // spot axis

				}

			} else {

				_target.set( 0, 0, 0 );

			}

			l1.set( _target.x, _target.y, _target.z, object.distance || 0 );

			const color = object.color, intensity = object.intensity;
			l2.set( color.r * intensity, color.g * intensity, color.b * intensity, object.decay !== undefined ? object.decay : 2 );

			// the light's shadow map is used for the injected visibility when available

			let shadowTexture = null;

			if ( object.castShadow === true && renderer.shadowMap.enabled === true && object.shadow.map !== null && object.shadow.map.depthTexture !== undefined ) {

				const shadow = object.shadow;

				shadowTexture = shadow.map.depthTexture;
				this._shadowMatrices[ count ].value.copy( shadow.matrix );
				this._shadowParams[ count ].value.set( shadow.bias, shadow.camera.near, shadow.camera.far, 0 );

			}

			this._lightTypes.push( type );
			this._lightShadows.push( shadowTexture );

			if ( type === 2 ) {

				l3.set( Math.cos( object.angle ), Math.cos( object.angle * ( 1 - object.penumbra ) ), 0, 0 );

			} else {

				l3.set( 0, 0, 0, 0 );

			}

			key += `|${ type },${ l0.x.toFixed( 3 ) },${ l0.y.toFixed( 3 ) },${ l0.z.toFixed( 3 ) },${ l1.x.toFixed( 4 ) },${ l1.y.toFixed( 4 ) },${ l1.z.toFixed( 4 ) },${ l1.w },${ l2.x.toFixed( 3 ) },${ l2.y.toFixed( 3 ) },${ l2.z.toFixed( 3 ) },${ l2.w },${ l3.x.toFixed( 4 ) },${ l3.y.toFixed( 4 ) },${ shadowTexture !== null ? shadowTexture.uuid : '-' }`;

			count ++;

		} );

		this._lightCountNode.value = count;

		// injection parameters that are baked into the cached radiance

		key += `|${ this.bounces },${ this.bounceConeAngle.value },${ this.shadowConeAngle.value },${ this.stepScale.value },${ this.maxDistance.value }`;

		// the inject kernels are specialized for the set of lights and their shadow maps

		this._lightsKey = this._lightTypes.map( ( type, i ) => type + ':' + ( this._lightShadows[ i ] !== null ? this._lightShadows[ i ].uuid : '-' ) ).join( '|' );

		return key;

	}

	_updateLighting( renderer ) {

		const kernels = this._getKernels();
		const bounces = Math.max( 0, Math.round( this.bounces ) );

		// the ping-pong order is chosen so the final result always ends up in `radianceTexture`

		let index = bounces % 2;

		if ( kernels.inject[ index ] === null || kernels.injectKey[ index ] !== this._lightsKey ) {

			kernels.inject[ index ] = this._createInjectKernel( renderer, index );
			kernels.injectKey[ index ] = this._lightsKey;

		}

		renderer.compute( kernels.inject[ index ] );

		for ( const kernel of kernels.radianceMips[ index ] ) renderer.compute( kernel );

		for ( let i = 0; i < bounces; i ++ ) {

			const target = 1 - index;

			renderer.compute( kernels.bounce[ target ] );

			for ( const kernel of kernels.radianceMips[ target ] ) renderer.compute( kernel );

			index = target;

		}

	}

	// kernels

	_getRadianceTexture( index ) {

		return index === 0 ? this.radianceTexture : this._pingPongTexture;

	}

	_getDirectionalTexture( index ) {

		return index === 0 ? this.directionalTexture : this._pingPongDirectionalTexture;

	}

	_getKernels() {

		if ( this._kernels !== null ) return this._kernels;

		const kernels = {
			clear: this._createClearKernel(),
			voxelize: this._createVoxelizeKernel(),
			resolve: this._createResolveKernel(),
			opacityMips: [],
			radianceMips: [[], []],
			inject: [ null, null ],
			injectKey: [ null, null ],
			bounce: [ null, null ]
		};

		for ( let level = 1; level < this._levels; level ++ ) {

			kernels.opacityMips.push( this._createOpacityMipKernel( level ) );

			// the coarser radiance levels are either isotropic mips or directionally filtered

			for ( let index = 0; index < 2; index ++ ) {

				kernels.radianceMips[ index ].push( this._directional === true ? this._createDirectionalKernel( index, level ) : this._createRadianceMipKernel( this._getRadianceTexture( index ), level ) );

			}

		}

		kernels.bounce[ 0 ] = this._createBounceKernel( 0 );
		kernels.bounce[ 1 ] = this._createBounceKernel( 1 );

		this._kernels = kernels;

		return kernels;

	}

	_getLevelSize( level ) {

		return [ this._gridSize.x >> level, this._gridSize.y >> level, this._gridSize.z >> level ];

	}

	/**
	 * Returns the 3D coordinates of the given linear voxel index.
	 *
	 * @private
	 */
	_coords( index, size ) {

		const [ x, y ] = size;

		return uvec3( index.mod( uint( x ) ), index.div( uint( x ) ).mod( uint( y ) ), index.div( uint( x * y ) ) );

	}

	_createClearKernel() {

		const occupancy = storage( this._occupancyAttribute, 'uint', this._voxelCount );
		const triangleIds = storage( this._triangleIdAttribute, 'uint', this._voxelCount );
		const voxelCount = this._voxelCountNode;

		return Fn( () => {

			If( instanceIndex.lessThan( voxelCount ), () => {

				occupancy.element( instanceIndex ).assign( uint( 0 ) );
				triangleIds.element( instanceIndex ).assign( uint( 0 ) );

			} );

		} )().compute( this._voxelCount ).setName( 'VXGI.Clear' );

	}

	_createVoxelizeKernel() {

		const occupancy = storage( this._occupancyAttribute, 'uint', this._voxelCount ).toAtomic();
		const triangleIds = storage( this._triangleIdAttribute, 'uint', this._voxelCount );
		const triangles = this._trianglesNode;
		const triangleCount = this._triangleCountNode;
		const boundsMin = this.boundsMinNode;
		const invSubVoxel = float( 2 ).div( this.voxelSizeNode );
		const [ gx, gy ] = this._gridSizeNode;
		const subSize = vec3( this._gridSize.x * 2, this._gridSize.y * 2, this._gridSize.z * 2 );

		return Fn( () => {

			const triangleIndex = instanceIndex;

			If( triangleIndex.lessThan( triangleCount ), () => {

				const base = triangleIndex.mul( 5 ).toConst();

				// triangle in sub-voxel space

				const p0 = triangles.element( base ).xyz.sub( boundsMin ).mul( invSubVoxel ).toConst();
				const p1 = triangles.element( base.add( 1 ) ).xyz.sub( boundsMin ).mul( invSubVoxel ).toConst();
				const p2 = triangles.element( base.add( 2 ) ).xyz.sub( boundsMin ).mul( invSubVoxel ).toConst();

				const n = cross( p1.sub( p0 ), p2.sub( p0 ) ).toConst();
				const an = abs( n ).toConst();

				// project along the dominant axis: swizzle so the dominant axis becomes z

				const isZ = an.z.greaterThanEqual( an.x ).and( an.z.greaterThanEqual( an.y ) ).toConst();
				const isY = isZ.not().and( an.y.greaterThanEqual( an.x ) ).toConst();

				const swizzle = ( v ) => select( isZ, v.xyz, select( isY, v.zxy, v.yzx ) );

				const q0 = swizzle( p0 ).toConst();
				const q1 = swizzle( p1 ).toConst();
				const q2 = swizzle( p2 ).toConst();
				const nq = swizzle( n ).toConst();
				const sd = swizzle( subSize ).toConst();

				const qmin = min( q0, min( q1, q2 ) ).toConst();
				const qmax = max( q0, max( q1, q2 ) ).toConst();

				const i0 = int( floor( qmin.x ) ).max( 0 ).toConst();
				const i1 = int( floor( qmax.x ) ).min( int( sd.x ).sub( 1 ) ).toConst();
				const j0 = int( floor( qmin.y ) ).max( 0 ).toConst();
				const j1 = int( floor( qmax.y ) ).min( int( sd.y ).sub( 1 ) ).toConst();

				// conservative edge functions

				const areaSign = sign( nq.z ).toConst();

				const edge = ( a, b ) => {

					const normal = vec2( a.y.sub( b.y ), b.x.sub( a.x ) ).mul( areaSign ).toConst();
					const bias = float( 0.5 ).mul( abs( normal.x ).add( abs( normal.y ) ) ).toConst();

					return { a, normal, bias };

				};

				const e0 = edge( q0.xy, q1.xy );
				const e1 = edge( q1.xy, q2.xy );
				const e2 = edge( q2.xy, q0.xy );

				const halfExtent = float( 0.5 ).mul( abs( nq.x ).add( abs( nq.y ) ) ).div( abs( nq.z ) ).toConst();

				Loop( { start: i0, end: i1, type: 'int', condition: '<=', name: 'i' }, { start: j0, end: j1, type: 'int', condition: '<=', name: 'j' }, ( { i, j } ) => {

					const c = vec2( float( i ).add( 0.5 ), float( j ).add( 0.5 ) ).toConst();

					const inside = dot( e0.normal, c.sub( e0.a ) ).add( e0.bias ).greaterThanEqual( 0 )
						.and( dot( e1.normal, c.sub( e1.a ) ).add( e1.bias ).greaterThanEqual( 0 ) )
						.and( dot( e2.normal, c.sub( e2.a ) ).add( e2.bias ).greaterThanEqual( 0 ) );

					If( inside, () => {

						// depth range of the triangle plane within this column

						const wc = q0.z.sub( nq.x.mul( c.x.sub( q0.x ) ).add( nq.y.mul( c.y.sub( q0.y ) ) ).div( nq.z ) ).toConst();

						const k0 = int( floor( max( wc.sub( halfExtent ), qmin.z ) ) ).max( 0 ).toConst();
						const k1 = int( floor( min( wc.add( halfExtent ), qmax.z ) ) ).min( int( sd.z ).sub( 1 ) ).toConst();

						Loop( { start: k0, end: k1, type: 'int', condition: '<=', name: 'k' }, ( { k } ) => {

							const s = select( isZ, ivec3( i, j, k ), select( isY, ivec3( j, k, i ), ivec3( k, i, j ) ) ).toConst();

							const voxel = uvec3( s.div( 2 ) ).toConst();
							const bit = uint( s.x.bitAnd( 1 ) ).bitOr( uint( s.y.bitAnd( 1 ) ).shiftLeft( uint( 1 ) ) ).bitOr( uint( s.z.bitAnd( 1 ) ).shiftLeft( uint( 2 ) ) ).toConst();
							const voxelIndex = voxel.x.add( gx.mul( voxel.y.add( gy.mul( voxel.z ) ) ) ).toConst();

							atomicOr( occupancy.element( voxelIndex ), uint( 1 ).shiftLeft( bit ) );
							triangleIds.element( voxelIndex ).assign( triangleIndex.add( 1 ) );

						} );

					} );

				} );

			} );

		} )().compute( this._triangleCount ).setName( 'VXGI.Voxelize' );

	}

	_createResolveKernel() {

		const occupancy = storage( this._occupancyAttribute, 'uint', this._voxelCount ).toReadOnly();
		const opacityTexture = this.opacityTexture;
		const voxelCount = this._voxelCountNode;
		const size = this._getLevelSize( 0 );

		return Fn( () => {

			If( instanceIndex.lessThan( voxelCount ), () => {

				const coords = this._coords( instanceIndex, size ).toConst();
				const bits = occupancy.element( instanceIndex ).toConst();

				// per-axis coverage from the 2x2x2 sub-voxel occupancy

				const coverage = ( m0, m1, m2, m3 ) => {

					return select( bits.bitAnd( uint( m0 ) ).notEqual( uint( 0 ) ), 0.25, 0 )
						.add( select( bits.bitAnd( uint( m1 ) ).notEqual( uint( 0 ) ), 0.25, 0 ) )
						.add( select( bits.bitAnd( uint( m2 ) ).notEqual( uint( 0 ) ), 0.25, 0 ) )
						.add( select( bits.bitAnd( uint( m3 ) ).notEqual( uint( 0 ) ), 0.25, 0 ) );

				};

				const opacityX = coverage( 0x03, 0x0C, 0x30, 0xC0 );
				const opacityY = coverage( 0x05, 0x0A, 0x50, 0xA0 );
				const opacityZ = coverage( 0x11, 0x22, 0x44, 0x88 );
				const occupied = float( countOneBits( bits ) ).div( 8 );

				textureStore( opacityTexture, coords, vec4( opacityX, opacityY, opacityZ, occupied ) );

			} );

		} )().compute( this._voxelCount ).setName( 'VXGI.Resolve' );

	}

	_createOpacityMipKernel( level ) {

		const size = this._getLevelSize( level );
		const count = size[ 0 ] * size[ 1 ] * size[ 2 ];

		const source = new MipStorageTexture3DNode( this.opacityTexture, 'readOnly', level - 1 );
		const target = new MipStorageTexture3DNode( this.opacityTexture, 'writeOnly', level );

		return Fn( () => {

			If( instanceIndex.lessThan( uint( count ) ), () => {

				const coords = this._coords( instanceIndex, size ).toConst();
				const base = ivec3( coords.mul( uint( 2 ) ) ).toConst();

				const children = [];

				for ( let z = 0; z < 2; z ++ ) {

					for ( let y = 0; y < 2; y ++ ) {

						for ( let x = 0; x < 2; x ++ ) {

							children[ x + y * 2 + z * 4 ] = source.load( base.add( ivec3( x, y, z ) ) ).toConst();

						}

					}

				}

				// along each axis the two children are combined, across the axis they are averaged

				const child = ( x, y, z ) => children[ x + y * 2 + z * 4 ];
				const combine = ( a, b ) => a.oneMinus().mul( b.oneMinus() ).oneMinus();

				let opacityX = float( 0 ), opacityY = float( 0 ), opacityZ = float( 0 ), occupied = float( 0 );

				for ( let a = 0; a < 2; a ++ ) {

					for ( let b = 0; b < 2; b ++ ) {

						opacityX = opacityX.add( combine( child( 0, a, b ).x, child( 1, a, b ).x ) );
						opacityY = opacityY.add( combine( child( a, 0, b ).y, child( a, 1, b ).y ) );
						opacityZ = opacityZ.add( combine( child( a, b, 0 ).z, child( a, b, 1 ).z ) );

					}

				}

				for ( let i = 0; i < 8; i ++ ) occupied = occupied.add( children[ i ].w );

				textureStore( target, coords, vec4( opacityX.mul( 0.25 ), opacityY.mul( 0.25 ), opacityZ.mul( 0.25 ), occupied.mul( 0.125 ) ) );

			} );

		} )().compute( count ).setName( 'VXGI.OpacityMip' + level );

	}

	_createRadianceMipKernel( radianceTexture, level ) {

		const size = this._getLevelSize( level );
		const count = size[ 0 ] * size[ 1 ] * size[ 2 ];

		const source = new MipStorageTexture3DNode( radianceTexture, 'readOnly', level - 1 );
		const target = new MipStorageTexture3DNode( radianceTexture, 'writeOnly', level );

		return Fn( () => {

			If( instanceIndex.lessThan( uint( count ) ), () => {

				const coords = this._coords( instanceIndex, size ).toConst();
				const base = ivec3( coords.mul( uint( 2 ) ) ).toConst();

				let sum = vec4( 0 );

				for ( let z = 0; z < 2; z ++ ) {

					for ( let y = 0; y < 2; y ++ ) {

						for ( let x = 0; x < 2; x ++ ) {

							sum = sum.add( source.load( base.add( ivec3( x, y, z ) ) ) );

						}

					}

				}

				textureStore( target, coords, sum.mul( 0.125 ) );

			} );

		} )().compute( count ).setName( 'VXGI.RadianceMip' + level );

	}

	/**
	 * Creates the kernel that filters the six direction blocks of the directional texture at a
	 * level from the next finer level: along the direction's axis the two finer voxels are
	 * composited front to back with the front voxel's opacity along that axis, across the axis
	 * they are averaged. Level 1 is filtered from the isotropic finest level, where a voxel only
	 * contributes to the directions its surface faces against.
	 *
	 * @private
	 */
	_createDirectionalKernel( index, level ) {

		const size = this._getLevelSize( level );
		const count = size[ 0 ] * size[ 1 ] * size[ 2 ];
		const texture = this._getDirectionalTexture( index );
		const opacity = texture3D( this.opacityTexture );
		const radiance = texture3D( this._getRadianceTexture( index ) );
		const normals = texture3D( this._normalTexture );

		// level n of the volume is level n - 1 of the half resolution directional texture

		const source = level === 1 ? null : new MipStorageTexture3DNode( texture, 'readOnly', level - 2 );
		const target = new MipStorageTexture3DNode( texture, 'writeOnly', level - 1 );
		const blockWidth = size[ 0 ];

		return Fn( () => {

			If( instanceIndex.lessThan( uint( count ) ), () => {

				const coords = this._coords( instanceIndex, size ).toConst();
				const base = ivec3( coords.mul( uint( 2 ) ) ).toConst();

				const offset = ( i ) => ivec3( i & 1, ( i >> 1 ) & 1, ( i >> 2 ) & 1 );

				const childOpacity = [];
				const childNormal = [];
				const childRadiance = [];

				for ( let i = 0; i < 8; i ++ ) {

					childOpacity.push( opacity.load( base.add( offset( i ) ) ).level( level - 1 ).toConst() );

					if ( level === 1 ) {

						childNormal.push( normals.load( base.add( offset( i ) ) ).xyz.mul( 2 ).sub( 1 ).toConst() );
						childRadiance.push( radiance.load( base.add( offset( i ) ) ).toConst() );

					}

				}

				for ( let direction = 0; direction < 6; direction ++ ) {

					const [ axis, sign ] = DIRECTIONS[ direction ];
					const travel = vec3( axis === 0 ? sign : 0, axis === 1 ? sign : 0, axis === 2 ? sign : 0 );
					const block = ivec3( direction * blockWidth * 2, 0, 0 ); // block offset in the finer level

					// a child holds the radiance of its surfaces facing the direction premultiplied by
					// their weight (rgb) and the weight (a); at the finest level a voxel only counts for a
					// direction if its surface faces against it, so a surface parallel to the axis does
					// not mix in. The front child hides the back child by its opacity along the axis.

					const child = ( i ) => level === 1
						? childRadiance[ i ].mul( smoothstep( 0, 0.3, dot( childNormal[ i ], travel.negate() ) ) )
						: source.load( base.add( block ).add( offset( i ) ) );
					const axisOpacity = ( i ) => [ childOpacity[ i ].x, childOpacity[ i ].y, childOpacity[ i ].z ][ axis ];

					let sum = vec4( 0 );

					for ( let i = 0; i < 8; i ++ ) {

						// each column along the axis is composited once, starting at its front voxel

						if ( ( ( i >> axis ) & 1 ) !== ( sign > 0 ? 0 : 1 ) ) continue;

						const front = i;
						const back = i ^ ( 1 << axis );

						sum = sum.add( child( front ) ).add( child( back ).mul( axisOpacity( front ).oneMinus() ) );

					}

					textureStore( target, ivec3( coords ).add( ivec3( direction * blockWidth, 0, 0 ) ), sum.mul( 0.25 ) );

				}

			} );

		} )().compute( count ).setName( 'VXGI.Directional' + level );

	}

	/**
	 * Emits the code for reading the surface data of the given voxel.
	 *
	 * @private
	 */
	_surface( coords, triangleId ) {

		const triangles = this._trianglesNode;

		const base = triangleId.sub( 1 ).mul( 5 ).toConst();
		const a = triangles.element( base ).xyz.toConst();
		const b = triangles.element( base.add( 1 ) ).xyz.toConst();
		const c = triangles.element( base.add( 2 ) ).xyz.toConst();
		const albedo = triangles.element( base.add( 3 ) ).toConst();
		const emissive = triangles.element( base.add( 4 ) ).xyz.toConst();

		const normal = normalize( cross( b.sub( a ), c.sub( a ) ) ).toVar();
		normal.assign( select( albedo.w.equal( 1 ), normal.negate(), normal ) ); // back side

		const position = this.boundsMinNode.add( vec3( coords ).add( 0.5 ).mul( this.voxelSizeNode ) ).toConst();

		return { position, normal, albedo: albedo.xyz, side: albedo.w, emissive };

	}

	_createInjectKernel( renderer, index ) {

		const occupancy = storage( this._occupancyAttribute, 'uint', this._voxelCount ).toReadOnly();
		const triangleIds = storage( this._triangleIdAttribute, 'uint', this._voxelCount ).toReadOnly();
		const voxelCount = this._voxelCountNode;
		const size = this._getLevelSize( 0 );
		const voxelSize = this.voxelSizeNode;
		const lights = this._lightsNode;

		const directTexture = this._directTexture;
		const normalTexture = this._normalTexture;
		const radianceTexture = this._getRadianceTexture( index );

		const lightTypes = this._lightTypes.slice();
		const lightShadows = this._lightShadows.slice();
		const shadowMatrices = this._shadowMatrices;
		const shadowParams = this._shadowParams;
		const reversedDepth = renderer.reversedDepthBuffer === true;
		const shadowTanHalfAngle = this.shadowConeAngle.mul( 0.5 ).radians().tan();

		const trace = createConeTracer( this, { maxSteps: 256 } );

		return Fn( () => {

			If( instanceIndex.lessThan( voxelCount ), () => {

				const coords = this._coords( instanceIndex, size ).toConst();
				const bits = occupancy.element( instanceIndex ).toConst();
				const result = vec4( 0 ).toVar();
				const encodedNormal = normalTexture !== null ? vec4( 0 ).toVar() : null;

				If( bits.notEqual( uint( 0 ) ), () => {

					const surface = this._surface( coords, triangleIds.element( instanceIndex ) );
					const { position, normal, albedo, side, emissive } = surface;

					if ( encodedNormal !== null ) encodedNormal.assign( vec4( normal.mul( 0.5 ).add( 0.5 ), 1 ) );

					const irradiance = vec3( 0 ).toVar();

					// one specialized block per light; the kernel is rebuilt when the light set changes

					for ( let i = 0; i < lightTypes.length; i ++ ) {

						const type = lightTypes[ i ];
						const shadowTexture = lightShadows[ i ];

						const l0 = lights.element( i * 4 ).toConst();
						const l1 = lights.element( i * 4 + 1 ).toConst();
						const l2 = lights.element( i * 4 + 2 ).toConst();
						const l3 = lights.element( i * 4 + 3 ).toConst();

						const lightDirection = vec3( 0 ).toVar();
						const lightDistance = float( 1e10 ).toVar();
						const attenuation = float( 1 ).toVar();

						if ( type === 0 ) {

							lightDirection.assign( l1.xyz );

						} else {

							const lightVector = l0.xyz.sub( position ).toConst();
							lightDistance.assign( length( lightVector ) );
							lightDirection.assign( lightVector.div( lightDistance ) );
							attenuation.assign( getDistanceAttenuation( { lightDistance, cutoffDistance: l1.w, decayExponent: l2.w } ) );

							if ( type === 2 ) {

								attenuation.mulAssign( smoothstep( l3.x, l3.y, dot( l1.xyz, lightDirection.negate() ) ) );

							}

						}

						const ndl = dot( normal, lightDirection ).toVar();
						ndl.assign( select( side.equal( 2 ), abs( ndl ), max( ndl, 0 ) ) );

						If( ndl.greaterThan( 0 ).and( attenuation.greaterThan( 0 ) ), () => {

							const visibility = float( 1 ).toVar();
							const shadowPosition = position.add( normal.mul( voxelSize ) ).toConst();

							if ( shadowTexture === null ) {

								// no shadow map: trace a visibility cone through the volume

								const origin = position.add( normal.mul( voxelSize.mul( 1.5 ) ) );
								const occlusion = trace( origin, lightDirection, shadowTanHalfAngle, lightDistance.sub( voxelSize ) );
								visibility.assign( occlusion.alpha.oneMinus() );

							} else if ( type === 1 ) {

								// point light: cube shadow map addressed by the light-to-voxel vector

								const params = shadowParams[ i ];
								const bias = params.x, near = params.y, far = params.z;

								const lightToVoxel = shadowPosition.sub( l0.xyz ).toConst();
								const absVector = abs( lightToVoxel ).toConst();
								const viewZ = max( max( absVector.x, absVector.y ), absVector.z ).toConst();

								If( viewZ.greaterThanEqual( near ).and( viewZ.lessThanEqual( far ) ), () => {

									const depth = nodeObject( new PlainCubeTextureNode( shadowTexture, normalize( lightToVoxel ) ) ).r; // depth cubes need an integer level, which the compute path emits by default

									if ( reversedDepth ) {

										const reference = viewZToReversedPerspectiveDepth( viewZ.negate(), near, far ).sub( bias );
										visibility.assign( select( reference.greaterThanEqual( depth ), 1, 0 ) );

									} else {

										const reference = viewZToPerspectiveDepth( viewZ.negate(), near, far ).add( bias );
										visibility.assign( select( reference.lessThanEqual( depth ), 1, 0 ) );

									}

								} );

							} else {

								// directional and spot lights: 2D shadow map addressed by the shadow matrix

								const bias = shadowParams[ i ].x;

								const clip = shadowMatrices[ i ].mul( vec4( shadowPosition, 1 ) ).toConst();
								const coord = clip.xyz.div( clip.w ).toConst();
								const uv = vec2( coord.x, coord.y.oneMinus() ).toConst();

								const inside = uv.x.greaterThanEqual( 0 ).and( uv.x.lessThanEqual( 1 ) ).and( uv.y.greaterThanEqual( 0 ) ).and( uv.y.lessThanEqual( 1 ) ).and( coord.z.greaterThanEqual( 0 ) ).and( coord.z.lessThanEqual( 1 ) ).toConst();

								If( inside, () => {

									const depth = texture( shadowTexture, uv ).r;

									if ( reversedDepth ) {

										visibility.assign( select( coord.z.sub( bias ).greaterThanEqual( depth ), 1, 0 ) );

									} else {

										visibility.assign( select( coord.z.add( bias ).lessThanEqual( depth ), 1, 0 ) );

									}

								} );

							}

							irradiance.addAssign( l2.xyz.mul( attenuation.mul( ndl ).mul( visibility ) ) );

						} );

					}

					const radiance = albedo.mul( irradiance ).div( PI ).add( emissive );
					const occupied = float( countOneBits( bits ) ).div( 8 );

					result.assign( vec4( radiance.mul( occupied ), occupied ) );

				} );

				textureStore( directTexture, coords, result );
				textureStore( radianceTexture, coords, result );

				if ( encodedNormal !== null ) textureStore( normalTexture, coords, encodedNormal );

			} );

		} )().compute( this._voxelCount ).setName( 'VXGI.Inject' );

	}

	_createBounceKernel( index ) {

		const occupancy = storage( this._occupancyAttribute, 'uint', this._voxelCount ).toReadOnly();
		const triangleIds = storage( this._triangleIdAttribute, 'uint', this._voxelCount ).toReadOnly();
		const voxelCount = this._voxelCountNode;
		const size = this._getLevelSize( 0 );
		const voxelSize = this.voxelSizeNode;

		const directTexture = this._directTexture;
		const sourceTexture = this._getRadianceTexture( 1 - index );
		const targetTexture = this._getRadianceTexture( index );

		const trace = createConeTracer( this, {
			radianceNode: texture3D( sourceTexture ),
			directionalNode: this._directional === true ? texture3D( this._getDirectionalTexture( 1 - index ) ) : null
		} );
		const traceDistance = this._traceDistance;
		const tanHalfAngle = this.bounceConeAngle.mul( 0.5 ).radians().tan();

		return Fn( () => {

			If( instanceIndex.lessThan( voxelCount ), () => {

				const coords = this._coords( instanceIndex, size ).toConst();
				const bits = occupancy.element( instanceIndex ).toConst();
				const result = vec4( 0 ).toVar();

				If( bits.notEqual( uint( 0 ) ), () => {

					const { position, normal, albedo } = this._surface( coords, triangleIds.element( instanceIndex ) );

					const direct = texture3D( directTexture, vec3( coords ).add( 0.5 ).div( vec3( size[ 0 ], size[ 1 ], size[ 2 ] ) ), float( 0 ) ).toConst();

					// tangent frame

					const up = select( abs( normal.y ).lessThan( 0.99 ), vec3( 0, 1, 0 ), vec3( 1, 0, 0 ) );
					const tangent = normalize( cross( normal, up ) ).toConst();
					const bitangent = cross( normal, tangent ).toConst();

					const rotation = hash( instanceIndex ).toConst();
					const gathered = vec3( 0 ).toVar();

					Loop( { start: 0, end: BOUNCE_CONE_COUNT, type: 'int', condition: '<', name: 'c' }, ( { c } ) => {

						// cosine-weighted directions, rotated per voxel

						const u1 = float( c ).add( 0.5 ).div( BOUNCE_CONE_COUNT ).toConst();
						const u2 = fract( float( c ).mul( 0.618034 ).add( rotation ) ).toConst();
						const sinTheta = sqrt( u1 ).toConst();
						const cosTheta = sqrt( u1.oneMinus() ).toConst();
						const phi = u2.mul( PI.mul( 2 ) ).toConst();

						const direction = normalize( tangent.mul( cos( phi ).mul( sinTheta ) ).add( bitangent.mul( sin( phi ).mul( sinTheta ) ) ).add( normal.mul( cosTheta ) ) ).toConst();
						const origin = position.add( normal.mul( voxelSize.mul( 1.5 ) ) ).toConst();

						const cone = trace( origin, direction, tanHalfAngle, traceDistance );

						gathered.addAssign( cone.color );

					} );

					const bounce = albedo.mul( gathered.div( BOUNCE_CONE_COUNT ) );

					result.assign( vec4( direct.rgb.add( bounce.mul( direct.a ) ), direct.a ) );

				} );

				textureStore( targetTexture, coords, result );

			} );

		} )().compute( this._voxelCount ).setName( 'VXGI.Bounce' );

	}

}

export { VXGIVolume };
