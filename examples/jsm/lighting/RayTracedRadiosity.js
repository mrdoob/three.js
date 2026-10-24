import { BackSide, Box3, BufferAttribute, BufferGeometry, ClampToEdgeWrapping, Color, DataUtils, DoubleSide, EquirectangularReflectionMapping, EquirectangularRefractionMapping, FrontSide, HalfFloatType, LinearMipmapLinearFilter, Matrix4, MirroredRepeatWrapping, Node, NodeMaterial, NodeUpdateType, QuadMesh, RendererUtils, RenderTarget, RepeatWrapping, SRGBColorSpace, StorageBufferAttribute, StructTypeNode, UnsignedByteType, Vector3, Vector4 } from 'three/webgpu';
import { Fn, If, Loop, abs, asin, atan, cos, cross, dFdx, dFdy, dot, float, fract, hash, int, length, luminance, mix, nodeObject, normalize, pmremTexture, screenCoordinate, select, sin, smoothstep, sqrt, storage, texture, uint, uniform, uv, uvec2, vec2, vec3, vec4 } from 'three/tsl';
import { BVHComputeData, bvhNodeBoundsStruct, bvhNodeStruct, intersectRayTriangle, rayIntersectionResultStruct, rayStruct, wgslTagCode, wgslTagFn } from 'three-mesh-bvh/webgpu';

import { LightMapper } from './LightMapper.js';

const _a = /*@__PURE__*/ new Vector3();
const _b = /*@__PURE__*/ new Vector3();
const _c = /*@__PURE__*/ new Vector3();
const _normal = /*@__PURE__*/ new Vector3();
const _color = /*@__PURE__*/ new Color();
const _rotation = /*@__PURE__*/ new Matrix4();
const _instanceMatrix = /*@__PURE__*/ new Matrix4();
const _instanceColor = /*@__PURE__*/ new Color();
const _averageColors = /*@__PURE__*/ new WeakMap();
const _white = /*@__PURE__*/ new Color( 1, 1, 1 );

let _rendererState;

// fixed point increments of the R2 and R3 low-discrepancy sequences, see
// https://extremelearning.com.au/unreasonable-effectiveness-of-quasirandom-sequences/

const R2 = [ 3242174889, 2447445414 ];
const R3 = [ 3518319154, 2882110346, 2360945575 ];

// latitude-longitude cells of the sky, sampled by their power

const SKY_COLUMNS = 128;
const SKY_ROWS = 64;

// vec4 items per material entry, emitter and analytic light, see _collect() and _createEmitters()

const MATERIAL_STRIDE = 11;
const EMITTER_STRIDE = 6;
const LIGHT_STRIDE = 4;

// the layers of the texture array that holds the material maps, every WebGPU device supports 256

const MAX_TEXTURE_LAYERS = 256;

// alpha modes of the materials, bits that are set for alpha tested and for transparent materials

const ALPHA_TEST = 1;
const ALPHA_BLEND = 2;

/**
 * Approximates diffuse global illumination with ray traced radiosity. Every sample casts
 * cosine-distributed rays from each point through a {@link https://github.com/gkjohnson/three-mesh-bvh three-mesh-bvh}
 * BVH of the scene, and looks up the light leaving the hit surfaces in a light map of the bounces.
 * Emissive surfaces and a sky with data on the CPU, like the textures of HDRLoader and EXRLoader, are
 * also sampled directly with shadow rays, so small lights and suns converge quickly.
 *
 * Further bounces are cached in a light map that `update()` solves iteratively, so the meshes need
 * light map UVs in `uv1`, e.g. generated with {@link unwrapUVs}.
 *
 * ```js
 * const radiosity = new RayTracedRadiosity();
 * radiosity.update( renderer, scene );
 *
 * const lightMapper = new LightMapper( renderer, size, rayTracedRadiosityIrradiance( radiosity ) );
 * ```
 *
 * The scene is collected by `update()`: call it again after changing the scene and create new
 * samplers afterwards. The direct light of directional, point, spot and rect area lights is left to
 * the materials, like with the other irradiance sources, but the cached bounces include it, so their
 * indirect light is baked. An equirectangular or cube texture in `scene.background` lights the scene
 * like a sky, scaled by `scene.backgroundIntensity`, background colors are ignored.
 *
 * The rays see the color, emissive, metalness and alpha maps of the materials through their `uv`
 * channel, resampled into a texture array of `textureSize`, up to 256 maps, the others count with
 * their average color. Alpha tested, transparent and `alphaHash` materials let light through by
 * their opacity. Instanced meshes and the pages of a multi-page atlas, see `mesh.userData.lightMapPage`,
 * are supported. Skinned and batched meshes, vertex colors and node materials are ignored.
 *
 * This class can only be used with {@link WebGPURenderer} and a WebGPU backend.
 *
 * @three_import import { RayTracedRadiosity, rayTracedRadiosityIrradiance } from 'three/addons/lighting/RayTracedRadiosity.js';
 */
class RayTracedRadiosity {

	/**
	 * Constructs a new ray traced radiosity solver.
	 *
	 * @param {Object} [options] - The options.
	 * @param {number} [options.rays=8] - The number of rays cast per point and sample.
	 * @param {number} [options.lightCandidates=4] - The number of candidate points on emissive surfaces per shadow ray.
	 * The shadow ray goes to one of them, picked by its unshadowed contribution.
	 * @param {number} [options.bounces=16] - The number of iterations used to solve the cached bounces. Each iteration adds one bounce, `0` disables the cache.
	 * @param {number} [options.cacheSamples=32] - The number of samples accumulated into the bounce cache after the iterations.
	 * @param {number} [options.cacheSize=256] - The size of the bounce cache light map in texels, per page of the atlas.
	 * @param {number} [options.textureSize=512] - The size in texels of the texture array layers that hold the material maps.
	 */
	constructor( { rays = 8, lightCandidates = 4, bounces = 16, cacheSamples = 32, cacheSize = 256, textureSize = 512 } = {} ) {

		/**
		 * The number of rays cast per point and sample.
		 *
		 * @type {number}
		 * @default 8
		 */
		this.rays = rays;

		/**
		 * The number of candidate points on emissive surfaces per shadow ray.
		 *
		 * @type {number}
		 * @default 4
		 */
		this.lightCandidates = lightCandidates;

		/**
		 * The number of iterations used to solve the cached bounces.
		 *
		 * @type {number}
		 * @default 16
		 */
		this.bounces = bounces;

		/**
		 * The number of samples accumulated into the bounce cache after the iterations.
		 *
		 * @type {number}
		 * @default 32
		 */
		this.cacheSamples = cacheSamples;

		/**
		 * The size of the bounce cache light map in texels, per page of the atlas. The pages are tiles of
		 * the cache, which is `cacheSize * Math.ceil( Math.sqrt( pages ) )` texels wide.
		 *
		 * @type {number}
		 * @default 256
		 */
		this.cacheSize = cacheSize;

		/**
		 * The size in texels of the texture array layers that hold the material maps.
		 *
		 * @type {number}
		 * @default 512
		 */
		this.textureSize = textureSize;

		/**
		 * World space distance that rays start above the receiving face, to avoid hitting it.
		 *
		 * @type {number}
		 * @default 0.001
		 */
		this.bias = 0.001;

		this._bvh = null;
		this._geometry = null;
		this._trace = null;
		this._surface = null;
		this._visibility = null;
		this._albedo = null;
		this._emission = null;
		this._emitterRadiance = null;
		this._materials = null;
		this._triangles = null;
		this._textures = null;
		this._textureList = [];
		this._alpha = false;
		this._emitters = null;
		this._lightTree = null;
		this._meshLightTree = null;
		this._lightMapMeshes = [];
		this._tiles = 1;
		this._cache = null;
		this._environment = null;
		this._sky = null;
		this._lights = null;
		this._lightCount = 0;

		this._environmentIntensity = uniform( 1 );
		this._environmentRotation = uniform( new Matrix4() );
		this._environmentInverseRotation = uniform( new Matrix4() );
		this._biasNode = uniform( this.bias );
		this._passNode = uniform( 0, 'uint' );
		this._pass = 0;
		this._renderId = - 1;

	}

	/**
	 * Collects the meshes of the scene, builds the BVH and solves the cached bounces. Call this again
	 * after changing the scene or the lighting.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene.
	 */
	update( renderer, scene ) {

		this._clear();
		this._collect( scene );
		this._createTextures( renderer );
		this._createTrace();

		if ( this.bounces > 0 ) {

			// the cached irradiance includes the direct light of the analytic lights, for their bounces

			this._cache = new LightMapper( renderer, this.cacheSize * this._tiles, ( position, normal ) => nodeObject( new RayTracedRadiosityIrradianceNode( this, position, normal, true ) ) );
			this._solve();

		}

	}

	/**
	 * Frees all internal resources.
	 */
	dispose() {

		this._clear();

	}

	/**
	 * Disposes the BVH, the material textures and the bounce cache.
	 *
	 * @private
	 */
	_clear() {

		if ( this._bvh !== null ) {

			this._bvh.dispose();
			this._geometry.dispose();

			this._bvh = null;
			this._geometry = null;

		}

		// the storage buffers of the scene are freed now, not only once they are garbage collected

		const buffers = new Set( [ this._triangles, this._materials, this._lights, this._emitters, this._lightTree?.nodes, this._meshLightTree?.nodes, this._sky ] );

		for ( const buffer of buffers ) buffer?.value.dispose();

		this._triangles = this._materials = this._lights = this._emitters = this._lightTree = this._meshLightTree = this._sky = null;

		if ( this._textures !== null ) {

			this._textures.dispose();
			this._textures = null;

		}

		if ( this._cache !== null ) {

			this._cache.dispose();
			this._cache = null;

		}

	}

	/**
	 * Merges the visible meshes into one world space geometry, builds its BVH and stores the
	 * materials, emissive triangles and lights.
	 *
	 * @private
	 * @param {Scene} scene - The scene.
	 */
	_collect( scene ) {

		scene.updateMatrixWorld();

		// a background texture is the sky, oriented like the rendered background

		const background = scene.background;

		if ( background !== null && ( background.isCubeTexture === true || background.mapping === EquirectangularReflectionMapping || background.mapping === EquirectangularRefractionMapping ) ) {

			this._environment = background;
			this._environmentIntensity.value = scene.backgroundIntensity;
			this._environmentInverseRotation.value.makeRotationFromEuler( scene.backgroundRotation );
			this._environmentRotation.value.copy( this._environmentInverseRotation.value ).transpose();
			this._sky = createSkyTable( background );

		} else {

			this._environment = null;
			this._sky = null;

		}

		const positions = [];
		const surfaces = [];
		const triangles = [];
		const materials = [];
		const emitters = [];
		const entries = new Map();
		const textures = new Map();
		const lightMapMeshes = [];

		this._alpha = false;

		// the layer of a map in the texture array, or -1

		const getLayer = ( map ) => {

			if ( isMap( map ) === false ) return - 1;

			if ( textures.has( map ) === false ) {

				if ( textures.size === MAX_TEXTURE_LAYERS ) {

					console.warn( 'THREE.RayTracedRadiosity: More than ' + MAX_TEXTURE_LAYERS + ' maps, the others count with their average color.' );
					return - 1;

				}

				textures.set( map, textures.size );

			}

			return textures.get( map );

		};

		// the transform, texture layer and wrapping of a map

		const wrapMode = ( wrap ) => wrap === ClampToEdgeWrapping ? 1 : ( wrap === MirroredRepeatWrapping ? 2 : 0 );

		const pushMap = ( map, layer ) => {

			if ( layer < 0 ) {

				materials.push( 0, 0, 0, - 1, 0, 0, 0, 0 );
				return;

			}

			if ( map.matrixAutoUpdate === true ) map.updateMatrix();

			const e = map.matrix.elements;

			materials.push( e[ 0 ], e[ 3 ], e[ 6 ], layer, e[ 1 ], e[ 4 ], e[ 7 ], wrapMode( map.wrapS ) + 4 * wrapMode( map.wrapT ) );

		};

		// one entry per material, light map availability and instance color: the diffuse color and front
		// side visibility, the emitted radiance and back side visibility, the metalness, alpha test, opacity
		// and alpha mode, then the color, emissive, metalness and alpha maps. Without light map UVs the color
		// is zero, since the surface can not sample the cached bounces

		const getEntry = ( material, hasLightMapUV, instanceColor = null ) => {

			const key = material.uuid + hasLightMapUV + ( instanceColor !== null ? instanceColor.toArray().join() : '' );

			if ( entries.has( key ) === false ) {

				const color = new Color( 0, 0, 0 );
				const emission = new Color( 0, 0, 0 );
				let metalness = 0, emissiveMap = null, metalnessMap = null;

				if ( material.isMeshBasicMaterial === true ) {

					// unlit surfaces emit their color, the map is their emissive map

					if ( material.color !== undefined ) emission.copy( material.color );
					if ( instanceColor !== null ) emission.multiply( instanceColor );
					emissiveMap = material.map;

				} else {

					if ( material.color !== undefined && hasLightMapUV ) color.copy( material.color );
					if ( instanceColor !== null ) color.multiply( instanceColor );
					if ( material.emissive !== undefined ) emission.copy( material.emissive ).multiplyScalar( material.emissiveIntensity ?? 1 );

					metalness = material.metalness ?? 0;
					emissiveMap = material.emissiveMap;
					metalnessMap = material.metalnessMap;

				}

				const mapLayer = getLayer( material.map );
				const emissiveLayer = getLayer( emissiveMap );
				const metalnessLayer = getLayer( metalnessMap );
				const alphaLayer = getLayer( material.alphaMap );

				// maps that are not in the texture array count with their average color. Metals have no
				// diffuse albedo, the metalness map scales the metalness like in the material

				if ( mapLayer < 0 ) color.multiply( getAverageColor( material.map ) );
				if ( emissiveLayer < 0 ) emission.multiply( getAverageColor( emissiveMap ) );

				if ( metalnessLayer < 0 ) {

					color.multiplyScalar( 1 - metalness * getAverageColor( metalnessMap ).b );
					metalness = 0;

				}

				const front = material.side !== BackSide ? 1 : 0;
				const back = material.side === BackSide || material.side === DoubleSide ? 1 : 0;

				const alphaTest = material.alphaTest ?? 0;
				const alphaMode = ( alphaTest > 0 ? ALPHA_TEST : 0 ) | ( material.transparent === true || material.alphaHash === true ? ALPHA_BLEND : 0 );

				// the average emission of an emissive map estimates the power of the emitters

				const power = emission.clone();
				if ( emissiveLayer >= 0 ) power.multiply( getAverageColor( emissiveMap ) );

				entries.set( key, { index: entries.size, emission: power, side: material.side } );

				materials.push( color.r, color.g, color.b, front, emission.r, emission.g, emission.b, back, metalness, alphaTest, material.opacity ?? 1, alphaMode );
				pushMap( material.map, mapLayer );
				pushMap( emissiveMap, emissiveLayer );
				pushMap( metalnessMap, metalnessLayer );
				pushMap( material.alphaMap, alphaLayer );

				if ( alphaMode !== 0 ) this._alpha = true;

			}

			return entries.get( key );

		};

		// directional, point and spot lights: the direction to the light or its position and the type,
		// the color times the intensity, the cutoff distance, decay and cone of point and spot lights,
		// and the axis of spot lights. Rect area lights are emitters

		const lights = [];
		const areaLights = [];

		// the pages of the atlas are tiles of the bounce cache

		const tiles = this._tiles = Math.ceil( Math.sqrt( countPages( scene ) ) );

		scene.traverseVisible( ( object ) => {

			if ( object.isDirectionalLight === true || object.isPointLight === true || object.isSpotLight === true ) {

				const color = _color.copy( object.color ).multiplyScalar( object.intensity );

				_a.setFromMatrixPosition( object.matrixWorld );

				if ( object.isDirectionalLight === true ) {

					object.target.updateWorldMatrix( true, false );
					_a.sub( _b.setFromMatrixPosition( object.target.matrixWorld ) ).normalize();
					lights.push( _a.x, _a.y, _a.z, 0, color.r, color.g, color.b, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

				} else if ( object.isPointLight === true ) {

					lights.push( _a.x, _a.y, _a.z, 1, color.r, color.g, color.b, 0, object.distance, object.decay, 0, 0, 0, 0, 0, 0 );

				} else {

					// the cone and penumbra like SpotLightNode

					object.target.updateWorldMatrix( true, false );
					_b.setFromMatrixPosition( object.target.matrixWorld ).subVectors( _a, _b ).normalize();
					lights.push( _a.x, _a.y, _a.z, 2, color.r, color.g, color.b, 0, object.distance, object.decay, Math.cos( object.angle ), Math.cos( object.angle * ( 1 - object.penumbra ) ), _b.x, _b.y, _b.z, 0 );

				}

			}

			if ( object.isRectAreaLight === true ) areaLights.push( object );

			if ( object.isMesh !== true || object.isSkinnedMesh || object.isBatchedMesh ) return;

			const geometry = object.geometry;
			const position = geometry.getAttribute( 'position' );
			const uv0 = geometry.getAttribute( 'uv' );
			const uv1 = geometry.getAttribute( 'uv1' );
			const index = geometry.getIndex();

			if ( uv1 !== undefined ) lightMapMeshes.push( object );

			// instances are expanded, each one with its transform, color and light map UVs

			const instances = object.isInstancedMesh === true ? object.count : 1;

			for ( let instance = 0; instance < instances; instance ++ ) {

				const matrixWorld = object.isInstancedMesh === true ? _instanceMatrix.multiplyMatrices( object.matrixWorld, object.getMatrixAt( instance, _instanceMatrix ) ) : object.matrixWorld;
				const instanceColor = object.isInstancedMesh === true && object.instanceColor !== null ? _instanceColor.fromBufferAttribute( object.instanceColor, instance ) : null;
				const transform = uv1 !== undefined ? lightMapTransform( object, instance, tiles ) : null;

				// mirrored transforms flip the winding of the world space triangles

				const order = matrixWorld.determinant() < 0 ? [ 0, 2, 1 ] : [ 0, 1, 2 ];

				const count = index !== null ? index.count : position.count;
				const drawStart = Math.max( 0, geometry.drawRange.start );
				const drawEnd = Math.min( count, geometry.drawRange.start + geometry.drawRange.count );
				const groups = geometry.groups.length > 0 ? geometry.groups : [ { start: 0, count: Infinity, materialIndex: 0 } ];

				for ( const group of groups ) {

					const material = Array.isArray( object.material ) ? object.material[ group.materialIndex ] : object.material;

					if ( material === undefined || material.visible === false ) continue;

					const entry = getEntry( material, uv1 !== undefined, instanceColor );
					const emissive = entry.emission.r + entry.emission.g + entry.emission.b > 0;

					const start = Math.max( drawStart, group.start );
					const end = Math.min( drawEnd, group.start + group.count );

					for ( let i = start; i + 2 < end; i += 3 ) {

						for ( const v of order ) {

							const vertex = index !== null ? index.getX( i + v ) : i + v;
							const u = transform !== null ? uv1.getX( vertex ) * transform.x + transform.z : 0;
							const w = transform !== null ? uv1.getY( vertex ) * transform.y + transform.w : 0;

							_a.fromBufferAttribute( position, vertex ).applyMatrix4( matrixWorld );
							positions.push( _a.x, _a.y, _a.z );
							surfaces.push( u, w, uv0 !== undefined ? uv0.getX( vertex ) : 0, uv0 !== undefined ? uv0.getY( vertex ) : 0 );

						}

						const p = positions.length - 9;
						const s = surfaces.length - 12;

						_a.fromArray( positions, p );
						_b.fromArray( positions, p + 3 ).sub( _a );
						_c.fromArray( positions, p + 6 ).sub( _a );

						const area = _normal.crossVectors( _b, _c ).length() / 2;
						const uvs = [ surfaces[ s + 2 ], surfaces[ s + 3 ], surfaces[ s + 6 ], surfaces[ s + 7 ], surfaces[ s + 10 ], surfaces[ s + 11 ] ];

						// the material entry, and the log2 of the uv0 texel density for the level of detail of the maps

						const uvArea = Math.abs( ( uvs[ 2 ] - uvs[ 0 ] ) * ( uvs[ 5 ] - uvs[ 1 ] ) - ( uvs[ 4 ] - uvs[ 0 ] ) * ( uvs[ 3 ] - uvs[ 1 ] ) ) / 2;

						triangles.push( entry.index, area > 0 && uvArea > 0 ? 0.5 * Math.log2( uvArea / area ) : 0 );

						if ( emissive && area > 0 ) emitters.push( { a: _a.clone(), e1: _b.clone(), e2: _c.clone(), area, emission: entry.emission, side: entry.side, entry: entry.index, uvs } );

					}

				}

			}

		} );

		// rect area lights are one-sided emissive quads facing their -z axis like RectAreaLightNode, they
		// are only sampled with the emitters and not part of the geometry

		const meshEmitters = emitters.length;

		for ( const light of areaLights ) {

			const emission = new Color().copy( light.color ).multiplyScalar( light.intensity );
			const halfWidth = new Vector3( light.width / 2, 0, 0 ).applyMatrix4( _rotation.extractRotation( light.matrixWorld ) );
			const halfHeight = new Vector3( 0, light.height / 2, 0 ).applyMatrix4( _rotation );
			const corner = new Vector3().setFromMatrixPosition( light.matrixWorld ).sub( halfWidth ).sub( halfHeight );
			const width = halfWidth.multiplyScalar( 2 ), height = halfHeight.multiplyScalar( 2 );
			const area = light.width * light.height / 2;

			if ( area > 0 ) {

				const options = { area, emission, side: FrontSide, entry: - 1, uvs: [ 0, 0, 0, 0, 0, 0 ] };

				emitters.push( { a: corner.clone(), e1: height.clone(), e2: width.clone().add( height ), ...options } );
				emitters.push( { a: corner.clone(), e1: width.clone().add( height ), e2: width.clone(), ...options } );

			}

		}

		// the triangles are not shared, so each one carries its light map UVs and uv0

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( positions ), 3 ) );
		geometry.setAttribute( 'surface', new BufferAttribute( new Float32Array( surfaces ), 4 ) );
		geometry.setIndex( new BufferAttribute( new Uint32Array( positions.length / 3 ).map( ( value, i ) => i ), 1 ) );

		const bvh = new BVHComputeData( geometry, { attributes: { position: 'vec4f', surface: 'vec4f' } } );
		bvh.update();

		// the BVH sorts the triangles of the index, the per triangle data follows their order

		const sorted = geometry.getIndex().array;
		const triangleData = new Float32Array( Math.max( sorted.length / 3, 2 ) * 2 );

		for ( let i = 0; i < sorted.length / 3; i ++ ) {

			const triangle = sorted[ i * 3 ] / 3;

			triangleData[ i * 2 ] = triangles[ triangle * 2 ];
			triangleData[ i * 2 + 1 ] = triangles[ triangle * 2 + 1 ];

		}

		this._geometry = geometry;
		this._bvh = bvh;
		this._lightMapMeshes = lightMapMeshes;
		this._triangles = storage( new StorageBufferAttribute( triangleData, 2 ), 'vec2', triangleData.length / 2 ).toReadOnly();
		this._textureList = Array.from( textures.keys() );

		// storage buffers of length one would be converted to scalars, so they hold at least two items

		this._materials = vec4Storage( materials );
		this._lights = vec4Storage( lights );
		this._lightCount = lights.length / ( LIGHT_STRIDE * 4 );
		this._createEmitters( emitters, meshEmitters );

	}

	/**
	 * Resamples the material maps into the layers of a texture array with mipmaps.
	 *
	 * @private
	 * @param {WebGPURenderer} renderer - The renderer.
	 */
	_createTextures( renderer ) {

		const textures = this._textureList;

		if ( textures.length === 0 ) return;

		// a texture array needs at least two layers, a single layer would be a 2D texture

		const size = this.textureSize;
		const target = new RenderTarget( size, size, { depth: Math.max( textures.length, 2 ), depthBuffer: false, generateMipmaps: true, minFilter: LinearMipmapLinearFilter, wrapS: RepeatWrapping, wrapT: RepeatWrapping, colorSpace: SRGBColorSpace } );

		const source = texture( textures[ 0 ], uv() );
		const material = new NodeMaterial();
		material.fragmentNode = source;

		const quad = new QuadMesh( material );

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		for ( let i = 0; i < textures.length; i ++ ) {

			// the mipmaps of all layers are generated once, after the last one

			source.value = textures[ i ];
			target.texture.mipmapsAutoUpdate = i === textures.length - 1;

			renderer.setRenderTarget( target, i );
			quad.render( renderer );

		}

		RendererUtils.restoreRendererState( renderer, _rendererState );

		material.dispose();

		this._textures = target;

	}

	/**
	 * Creates the functions that trace rays through the BVH and evaluate the materials of the hits.
	 *
	 * @private
	 */
	_createTrace() {

		const bvh = this._bvh;
		const { index, attributes } = bvh.storage;
		const { sampleTrianglePoint } = bvh.fns;
		const materials = this._materials;
		const triangles = this._triangles;
		const emitters = this._emitters;
		const textures = this._textures;

		// the texel of a material map, white without a map. The maps are layers of a texture array,
		// sampled at an explicit level of detail since the rays are not coherent, with their transform
		// and wrapping applied here. The coarsest levels are left out, they would blend the parts of atlases

		const maps = textures !== null ? texture( textures.texture, vec2( 0 ) ) : null;
		const maxLevel = Math.max( Math.log2( this.textureSize ) - 3, 0 ).toFixed( 1 );
		const sizeLevel = Math.log2( this.textureSize ).toFixed( 4 );

		const sampleMap = maps !== null ? wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiositySampleMap( item: u32, uv: vec2f, lod: f32 ) -> vec4f {

				let row0 = ${ materials }[ item ];
				let row1 = ${ materials }[ item + 1u ];

				if ( row0.w < 0.0 ) {

					return vec4f( 1.0 );

				}

				let wrap = vec2u( u32( row1.w ) & 3u, u32( row1.w ) >> 2u );
				var coord = vec2f( dot( row0.xyz, vec3f( uv, 1.0 ) ), dot( row1.xyz, vec3f( uv, 1.0 ) ) );
				coord = select( coord, clamp( coord, vec2f( 0.0 ), vec2f( 1.0 ) ), wrap == vec2u( 1u ) );
				coord = select( coord, 1.0 - abs( 1.0 - 2.0 * fract( coord * 0.5 ) ), wrap == vec2u( 2u ) );

				let level = lod + ${ sizeLevel } + 0.5 * log2( abs( row0.x * row1.y - row0.y * row1.x ) );

				return textureSampleLevel( ${ maps }, ${ maps }_sampler, coord, i32( row0.w ), clamp( level, 0.0, ${ maxLevel } ) );

			}
		` : wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiositySampleMap( item: u32, uv: vec2f, lod: f32 ) -> vec4f {

				return vec4f( 1.0 );

			}
		`;

		// the diffuse albedo, emitted radiance and opacity of a material at a uv0 coordinate. Alpha tested
		// texels are opaque or let all light through, transparent texels let light through by their opacity

		this._albedo = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiosityAlbedo( entry: u32, uv: vec2f, lod: f32 ) -> vec3f {

				let base = entry * ${ MATERIAL_STRIDE }u;
				let color = ${ materials }[ base ].rgb;

				if ( all( color == vec3f( 0.0 ) ) ) {

					return color;

				}

				let metalness = ${ materials }[ base + 2u ].x * ${ sampleMap }( base + 7u, uv, lod ).b;

				return color * ${ sampleMap }( base + 3u, uv, lod ).rgb * ( 1.0 - metalness );

			}
		`;

		this._emission = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiosityEmission( entry: u32, uv: vec2f, lod: f32 ) -> vec3f {

				let base = entry * ${ MATERIAL_STRIDE }u;
				let emission = ${ materials }[ base + 1u ].rgb;

				if ( all( emission == vec3f( 0.0 ) ) ) {

					return emission;

				}

				return emission * ${ sampleMap }( base + 5u, uv, lod ).rgb;

			}
		`;

		const coverage = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiosityCoverage( entry: u32, uv: vec2f, lod: f32 ) -> f32 {

				let base = entry * ${ MATERIAL_STRIDE }u;
				let alpha = ${ materials }[ base + 2u ];
				let mode = u32( alpha.w );

				if ( mode == 0u ) {

					return 1.0;

				}

				let opacity = alpha.z * ${ sampleMap }( base + 3u, uv, lod ).a * ${ sampleMap }( base + 9u, uv, lod ).g;

				if ( opacity < alpha.y ) {

					return 0.0;

				}

				return select( 1.0, opacity, ( mode & ${ ALPHA_BLEND }u ) != 0u );

			}
		`;

		// the emitted radiance at a point of an emitter by its barycentric coordinates, the material of
		// emissive meshes is evaluated there, rect area lights emit a constant radiance

		this._emitterRadiance = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiosityEmitterRadiance( base: u32, barycoord: vec2f ) -> vec3f {

				let corners = ${ emitters }[ base + 4u ];
				let last = ${ emitters }[ base + 5u ];

				if ( last.z < 0.0 ) {

					return ${ emitters }[ base + 3u ].rgb;

				}

				let uv = corners.xy * ( 1.0 - barycoord.x - barycoord.y ) + corners.zw * barycoord.x + last.xy * barycoord.y;
				let entry = u32( last.z );

				return ${ this._emission }( entry, uv, 0.0 ) * ${ coverage }( entry, uv, 0.0 );

			}
		`;

		// a random number per ray and triangle, for the stochastic transparency of the gathering rays

		const random = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiosityRandom( ray: ${ rayStruct }, triangle: u32 ) -> f32 {

				let o = bitcast<vec3u>( ray.origin );
				let d = bitcast<vec3u>( ray.direction );

				var h = ( o.x * 0x9e3779b9u ) ^ ( o.y * 0x85ebca6bu ) ^ ( o.z * 0xc2b2ae35u ) ^ ( d.x * 0x27d4eb2fu ) ^ ( d.y * 0x165667b1u ) ^ ( d.z * 0xd3a2646cu ) ^ triangle;
				h = h * 747796405u + 2891336453u;
				h = ( ( h >> ( ( h >> 28u ) + 4u ) ) ^ h ) * 277803737u;
				h = ( h >> 22u ) ^ h;

				return f32( h >> 8u ) * ${ 2 ** - 24 };

			}
		`;

		// the BVH traversal: the closest hit for the gathering rays and the transmittance for the shadow
		// rays, which stops at the first opaque hit. The geometry is in world space, so the rays are not
		// transformed. Alpha tested and transparent triangles are skipped like an any-hit shader would

		const boundsOrder = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiosityBoundsOrder( ray: ${ rayStruct }, splitAxis: u32, node: ${ bvhNodeStruct } ) -> bool {

				return ray.direction[ splitAxis ] >= 0.0;

			}
		`;

		const boundsDistance = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiosityBoundsDistance( ray: ${ rayStruct }, bounds: ${ bvhNodeBoundsStruct } ) -> f32 {

				let boundsMin = vec3f( bounds.min[ 0 ], bounds.min[ 1 ], bounds.min[ 2 ] );
				let boundsMax = vec3f( bounds.max[ 0 ], bounds.max[ 1 ], bounds.max[ 2 ] );

				let invDir = 1.0 / ray.direction;
				let tMinPlane = ( boundsMin - ray.origin ) * invDir;
				let tMaxPlane = ( boundsMax - ray.origin ) * invDir;
				let tMin = min( tMinPlane, tMaxPlane );
				let tMax = max( tMinPlane, tMaxPlane );

				let near = max( max( max( tMin.x, tMin.y ), tMin.z ), 0.0 );
				let far = min( min( tMax.x, tMax.y ), tMax.z );

				return select( - 1.0, near, far >= near && ( ray.maxDist <= 0.0 || near < ray.maxDist ) );

			}
		`;

		const triangleHit = wgslTagCode/* wgsl */`
			let i0 = ${ index }[ ti * 3u ];
			let i1 = ${ index }[ ti * 3u + 1u ];
			let i2 = ${ index }[ ti * 3u + 2u ];
			let hit = ${ intersectRayTriangle }( ray, ${ attributes }[ i0 ].position.xyz, ${ attributes }[ i1 ].position.xyz, ${ attributes }[ i2 ].position.xyz, 0.0 );
		`;

		const triangleCoverage = wgslTagCode/* wgsl */`
			let entry = u32( ${ triangles }[ ti ].x );
			var opacity = 1.0;

			if ( ${ materials }[ entry * ${ MATERIAL_STRIDE }u + 2u ].w != 0.0 ) {

				opacity = ${ coverage }( entry, ${ sampleTrianglePoint }( hit.barycoord, vec3u( i0, i1, i2 ) ).surface.zw, 0.0 );

			}
		`;

		const closestHit = bvh.getShapecastFn( {
			name: 'rayTracedRadiosityClosestHit',
			shapeStruct: rayStruct,
			resultStruct: rayIntersectionResultStruct,
			boundsOrderFn: boundsOrder,
			intersectsBoundsFn: wgslTagFn/* wgsl */`
				// fn
				fn rayTracedRadiosityClosestBounds( ray: ${ rayStruct }, bounds: ${ bvhNodeBoundsStruct }, result: ptr<function, ${ rayIntersectionResultStruct }> ) -> u32 {

					let dist = ${ boundsDistance }( ray, bounds );

					return select( 0u, 1u, dist >= 0.0 && ( ! result.didHit || dist < result.dist ) );

				}
			`,
			intersectRangeFn: wgslTagFn/* wgsl */`
				// fn
				fn rayTracedRadiosityClosestRange( ray: ${ rayStruct }, offset: u32, count: u32, result: ptr<function, ${ rayIntersectionResultStruct }> ) -> bool {

					var didHit = false;

					for ( var ti = offset; ti < offset + count; ti = ti + 1u ) {

						${ triangleHit }

						if ( hit.didHit && ( ray.maxDist <= 0.0 || hit.dist < ray.maxDist ) && ( ! result.didHit || hit.dist < result.dist ) ) {

							${ this._alpha ? wgslTagCode/* wgsl */`

								${ triangleCoverage }

								if ( opacity < 1.0 && ${ random }( ray, ti ) >= opacity ) {

									continue;

								}

							` : '' }

							result.didHit = true;
							result.dist = hit.dist;
							result.normal = hit.normal;
							result.side = hit.side;
							result.barycoord = hit.barycoord;
							result.indices = vec4u( i0, i1, i2, ti );

							didHit = true;

						}

					}

					return didHit;

				}
			`
		} );

		const shadowStruct = new StructTypeNode( { transmittance: 'float' }, 'RayTracedRadiosityShadow' );

		const anyHit = bvh.getShapecastFn( {
			name: 'rayTracedRadiosityAnyHit',
			shapeStruct: rayStruct,
			resultStruct: shadowStruct,
			boundsOrderFn: boundsOrder,
			intersectsBoundsFn: wgslTagFn/* wgsl */`
				// fn
				fn rayTracedRadiosityShadowBounds( ray: ${ rayStruct }, bounds: ${ bvhNodeBoundsStruct }, result: ptr<function, ${ shadowStruct }> ) -> u32 {

					return select( 0u, 1u, result.transmittance > 0.0 && ${ boundsDistance }( ray, bounds ) >= 0.0 );

				}
			`,
			intersectRangeFn: wgslTagFn/* wgsl */`
				// fn
				fn rayTracedRadiosityShadowRange( ray: ${ rayStruct }, offset: u32, count: u32, result: ptr<function, ${ shadowStruct }> ) -> bool {

					for ( var ti = offset; ti < offset + count && result.transmittance > 0.0; ti = ti + 1u ) {

						${ triangleHit }

						if ( hit.didHit && ( ray.maxDist <= 0.0 || hit.dist < ray.maxDist ) ) {

							${ this._alpha ? triangleCoverage : 'let opacity = 1.0;' }

							result.transmittance *= 1.0 - opacity;

						}

					}

					return result.transmittance < 1.0;

				}
			`
		} );

		// traces a ray and returns the barycentric coordinates of the hit, the triangle plus one, negated
		// for back faces, and the log2 of the hit distance over the uv0 texel density, for the level of
		// detail of the maps, or zeros if nothing is hit

		this._trace = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiosityTrace( origin: vec3f, direction: vec3f, maxDist: f32 ) -> vec4f {

				var ray: ${ rayStruct };
				ray.origin = origin;
				ray.direction = direction;
				ray.maxDist = maxDist;

				var hit: ${ rayIntersectionResultStruct };
				${ closestHit }( ray, &hit );

				if ( ! hit.didHit ) {

					return vec4f( 0.0 );

				}

				let footprint = ${ triangles }[ hit.indices.w ].y + log2( max( hit.dist, 1e-6 ) ) - 0.5 * log2( max( abs( dot( hit.normal, direction ) ), 1e-4 ) );

				return vec4f( hit.barycoord.yz, hit.side * ( f32( hit.indices.w ) + 1.0 ), footprint );

			}
		`;

		// the light map UV and uv0 of a hit

		this._surface = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiositySurface( hit: vec4f ) -> vec4f {

				let ti = u32( abs( hit.z ) ) - 1u;
				let indices = vec3u( ${ index }[ ti * 3u ], ${ index }[ ti * 3u + 1u ], ${ index }[ ti * 3u + 2u ] );

				return ${ sampleTrianglePoint }( vec3f( 1.0 - hit.x - hit.y, hit.xy ), indices ).surface;

			}
		`;

		// the transmittance of a shadow ray up to a distance, zero means unbounded

		this._visibility = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiosityVisibility( origin: vec3f, direction: vec3f, maxDist: f32 ) -> f32 {

				var ray: ${ rayStruct };
				ray.origin = origin;
				ray.direction = direction;
				ray.maxDist = maxDist;

				var shadow: ${ shadowStruct };
				shadow.transmittance = 1.0;

				${ anyHit }( ray, &shadow );

				return shadow.transmittance;

			}
		`;

	}

	/**
	 * Stores the emitters, triangles of emissive meshes and rect area lights, and bounding volume
	 * hierarchies over them, which sample the emitters by an estimate of their contribution to a point,
	 * see "Physically Based Rendering: From Theory to Implementation", 4th edition, section 12.6.3
	 * (Pharr et al., 2023). One hierarchy holds all emitters, another one only the emissive meshes.
	 *
	 * @private
	 * @param {Array<Object>} emitters - The emitters, the emissive meshes first.
	 * @param {number} meshEmitters - The number of emissive mesh triangles.
	 */
	_createEmitters( emitters, meshEmitters ) {

		const data = [];
		const items = [];

		for ( let i = 0; i < emitters.length; i ++ ) {

			const { a, e1, e2, area, emission, side, entry, uvs } = emitters[ i ];

			// the corner, edges and emission, then the uv0 of the corners and the material entry

			data.push(
				a.x, a.y, a.z, area,
				e1.x, e1.y, e1.z, 0,
				e2.x, e2.y, e2.z, side === DoubleSide ? 2 : ( side === BackSide ? 1 : 0 ),
				emission.r, emission.g, emission.b, 0,
				uvs[ 0 ], uvs[ 1 ], uvs[ 2 ], uvs[ 3 ],
				uvs[ 4 ], uvs[ 5 ], entry, 0
			);

			// bounds, power and the cone of emitted directions of each triangle

			const b = a.clone().add( e1 ), c = a.clone().add( e2 );
			const min = a.clone().min( b ).min( c ), max = a.clone().max( b ).max( c );
			const axis = new Vector3().crossVectors( e1, e2 ).normalize();

			if ( side === BackSide ) axis.negate();

			const power = area * ( 0.2126 * emission.r + 0.7152 * emission.g + 0.0722 * emission.b ) * ( side === DoubleSide ? 2 : 1 );

			items.push( { index: i, min, max, centroid: min.clone().add( max ).multiplyScalar( 0.5 ), power, axis, cosTheta: side === DoubleSide ? - 1 : 1 } );

		}

		this._emitters = vec4Storage( data );
		this._meshLightTree = createLightTree( items.slice( 0, meshEmitters ) );
		this._lightTree = meshEmitters < items.length ? createLightTree( items ) : this._meshLightTree;

	}

	/**
	 * Solves the cached bounces. Every iteration gathers one sample from the previous one, then the
	 * converged estimate is refined by accumulating samples.
	 *
	 * @private
	 */
	_solve() {

		const cache = this._cache;

		for ( const mesh of this._lightMapMeshes ) {

			cache.addObjects( [ mesh ], { page: 0, uvTransform: getTile( mesh.userData.lightMapPage ?? 0, this._tiles ) } );

		}

		// render targets start undefined, the first iteration must sample zero bounces

		cache.update( 0 );

		for ( let i = 0; i < this.bounces; i ++ ) {

			cache.reset();
			cache.update();

		}

		cache.reset();

		for ( let i = 0; i < this.cacheSamples; i ++ ) cache.update();

	}

	/**
	 * Advances the sample sequence once per render call of the gathering materials.
	 *
	 * @private
	 * @param {NodeFrame} frame - The current node frame.
	 */
	_advance( frame ) {

		if ( frame.renderId === this._renderId ) return;

		this._renderId = frame.renderId;
		this._passNode.value = ++ this._pass;
		this._biasNode.value = this.bias;

	}

	/**
	 * Returns the irradiance gathered with rays at a world-space position and normal.
	 *
	 * @private
	 * @param {Node<vec3>} positionNode - The world-space position.
	 * @param {Node<vec3>} normalNode - The world-space normal.
	 * @param {boolean} analyticLights - Whether to add the direct light of the analytic lights.
	 * @param {?Node<vec3>} [directionNode=null] - A variable to add the luminance-weighted light directions to.
	 * @return {Node<vec3>} The irradiance.
	 */
	_gather( positionNode, normalNode, analyticLights, directionNode = null ) {

		const rays = this.rays;
		const trace = this._trace;
		const visibility = this._visibility;
		const materials = this._materials;
		const triangles = this._triangles;
		const emitters = this._emitters;
		const cache = this._cache !== null ? texture( this._cache.texture ) : null;
		const environment = this._environment;
		const sky = environment !== null ? this._sky : null;

		// rect area lights are emitters, but their direct light is left to the materials like the one
		// of the other analytic lights

		const candidates = this.lightCandidates;
		const { nodes: lightTree, depth: treeDepth, count: emitterCount } = analyticLights ? this._lightTree : this._meshLightTree;

		// the materials of the hits, with their maps if there are any. The maps are sampled at the level
		// of detail of a ray cone, with the spread of a ray of a bake of about 32 samples

		const textured = this._textures !== null;
		const exactEmitters = textured || this._alpha;
		const spread = Math.log2( Math.sqrt( Math.PI / ( 32 * rays ) ) );

		const albedoAt = ( entry, coord, lod ) => textured ? this._albedo( uint( entry ), coord, lod ) : materials.element( entry.mul( MATERIAL_STRIDE ) ).rgb;

		// the importance of a light tree node for a point: its power over the squared distance, bounded
		// by the directions the node emits to and the receiver faces, see LightBounds::Importance() in pbrt-v4

		const cosSubClamped = ( sinA, cosA, sinB, cosB ) => select( cosA.greaterThan( cosB ), float( 1 ), cosA.mul( cosB ).add( sinA.mul( sinB ) ) );
		const sinSubClamped = ( sinA, cosA, sinB, cosB ) => select( cosA.greaterThan( cosB ), float( 0 ), sinA.mul( cosB ).sub( cosA.mul( sinB ) ) );

		const lightImportance = Fn( ( [ index, point, normal ] ) => {

			const lower = lightTree.element( index.mul( 3 ) ).toVar();
			const upper = lightTree.element( index.mul( 3 ).add( 1 ) ).toVar();
			const axis = lightTree.element( index.mul( 3 ).add( 2 ) ).xyz;

			const center = lower.xyz.add( upper.xyz ).mul( 0.5 );
			const radiusSq = dot( upper.xyz.sub( lower.xyz ), upper.xyz.sub( lower.xyz ) ).mul( 0.25 ).toVar();
			const offset = point.sub( center ).toVar();
			const distanceSq = dot( offset, offset ).toVar();
			const toPoint = offset.div( sqrt( distanceSq ).max( 1e-8 ) ).toVar();

			// angles of the emitted directions, of the point from the axis and subtended by the bounds

			const cosO = upper.w;
			const sinO = sqrt( cosO.mul( cosO ).oneMinus().max( 0 ) );
			const cosW = dot( axis, toPoint ).toVar();
			const sinW = sqrt( cosW.mul( cosW ).oneMinus().max( 0 ) );
			const inside = distanceSq.lessThan( radiusSq );
			const sinB = select( inside, float( 0 ), sqrt( radiusSq.div( distanceSq.max( 1e-8 ) ) ) ).toVar();
			const cosB = select( inside, float( - 1 ), sqrt( sinB.mul( sinB ).oneMinus().max( 0 ) ) ).toVar();

			const cosX = cosSubClamped( sinW, cosW, sinO, cosO ).toVar();
			const sinX = sinSubClamped( sinW, cosW, sinO, cosO );
			const cosP = cosSubClamped( sinX, cosX, sinB, cosB );

			const cosI = dot( normal, toPoint ).negate().toVar();
			const sinI = sqrt( cosI.mul( cosI ).oneMinus().max( 0 ) );
			const cosPI = cosSubClamped( sinI, cosI, sinB, cosB );

			// unlike pbrt, the distance is clamped to the radius of the bounds, which keeps small emitters
			// next to the point important

			return lower.w.mul( cosP.max( 0 ) ).mul( cosPI.max( 0 ) ).div( distanceSq.max( radiusSq ).max( 1e-8 ) );

		} );

		// the sky radiance in a world direction, times pi, and the density of sampling it by the sky table

		const skyRadiance = ( direction ) => pmremTexture( environment, this._environmentRotation.mul( direction ), float( 0 ) ).rgb.mul( this._environmentIntensity.mul( Math.PI ) );

		const skyDensity = ( direction ) => {

			const local = this._environmentRotation.mul( direction ).xyz.toVar();
			const column = int( atan( local.z, local.x ).div( 2 * Math.PI ).add( 0.5 ).mul( SKY_COLUMNS ) ).clamp( 0, SKY_COLUMNS - 1 );
			const row = int( asin( local.y.clamp( - 1, 1 ) ).div( Math.PI ).add( 0.5 ).mul( SKY_ROWS ) ).clamp( 0, SKY_ROWS - 1 );

			return sky.element( row.mul( SKY_COLUMNS ).add( column ) ).z;

		};

		// power heuristic of two strategies with one sample each

		const misWeight = ( density, otherDensity ) => density.mul( density ).div( density.mul( density ).add( otherDensity.mul( otherDensity ) ).max( 1e-20 ) );

		return Fn( () => {

			const position = positionNode.toVar();

			// a degenerate normal would poison the light map with NaNs

			const normalLength = length( normalNode ).toVar();
			const normal = select( normalLength.greaterThan( 1e-8 ), normalNode.div( normalLength ), vec3( 0, 1, 0 ) ).toVar();

			// rays start above the receiving face and must leave it, otherwise they would hit the face
			// itself or the inside of a curved surface

			const face = cross( dFdx( position ), dFdy( position ) ).toVar();
			const faceLength = length( face ).toVar();
			const faceNormal = select( faceLength.greaterThan( 1e-12 ), face.div( faceLength ), normal ).toVar();
			faceNormal.assign( select( dot( faceNormal, normal ).lessThan( 0 ), faceNormal.negate(), faceNormal ) );

			const origin = position.add( faceNormal.mul( this._biasNode ) ).toVar();

			const [ tangent, bitangent ] = orthonormalBasis( normal );

			// the low-discrepancy sequences continue over the samples, with one of nine random offsets per
			// pixel, which decorrelates neighbouring points but keeps the rays of a workgroup coherent

			const pixel = uvec2( screenCoordinate.xy );
			const offsetIndex = uint( hash( pixel.x.add( pixel.y.mul( 65536 ) ) ).mul( 9 ) ).min( 8 );
			const seed = offsetIndex.mul( 8 ).toVar();
			const offset = vec4( hash( seed ), hash( seed.add( 1 ) ), hash( seed.add( 2 ) ), hash( seed.add( 3 ) ) ).toVar();
			const lightOffset = hash( seed.add( 4 ) ).toVar();
			const skyOffset = vec3( hash( seed.add( 5 ) ), hash( seed.add( 6 ) ), hash( seed.add( 7 ) ) ).toVar();

			const gathered = vec3( 0 ).toVar();
			const direct = vec3( 0 ).toVar();
			const analytic = vec3( 0 ).toVar();

			// the luminance-weighted directions of the light of the rays, for directional light maps

			const rayDirection = directionNode !== null ? vec3( 0 ).toVar() : null;

			const weigh = ( light, direction ) => {

				if ( rayDirection !== null ) rayDirection.addAssign( direction.mul( luminance( light ) ) );

			};

			Loop( rays, ( { i } ) => {

				const n = this._passNode.mul( rays ).add( uint( i ) ).toVar();

				// cosine-distributed gathering ray

				if ( cache !== null || environment !== null ) {

					const u = fract( offset.xy.add( vec2( float( n.mul( R2[ 0 ] ) ), float( n.mul( R2[ 1 ] ) ) ).mul( 2 ** - 32 ) ) ).toVar();
					const radius = sqrt( u.x );
					const phi = u.y.mul( 2 * Math.PI );
					const direction = tangent.mul( radius.mul( cos( phi ) ) ).add( bitangent.mul( radius.mul( sin( phi ) ) ) ).add( normal.mul( sqrt( u.x.oneMinus().max( 0 ) ) ) ).toVar();

					If( dot( direction, faceNormal ).greaterThan( 0 ), () => {

						const hit = trace( origin, direction, float( 0 ) ).toVar();

						const surface = If( hit.z.notEqual( 0 ), () => {

							const entry = int( triangles.element( int( abs( hit.z ) ).sub( 1 ) ).x ).toVar();
							const coords = this._surface( hit ).toVar();
							const lod = hit.w.add( spread ).toVar();

							// light leaving the visible sides of the hit surface, times pi

							const facing = select( hit.z.lessThan( 0 ), materials.element( entry.mul( MATERIAL_STRIDE ).add( 1 ) ).w, materials.element( entry.mul( MATERIAL_STRIDE ) ).w );
							const radiance = vec3( 0 ).toVar();

							if ( cache !== null ) radiance.addAssign( albedoAt( entry, coords.zw, lod ).mul( cache.sample( coords.xy ).level( 0 ).rgb ) );

							radiance.mulAssign( facing );
							gathered.addAssign( radiance );
							weigh( radiance, direction );

						} );

						// rays that leave the scene see the sky, weighted against sampling it directly

						if ( environment !== null ) {

							surface.Else( () => {

								const weight = sky !== null ? misWeight( dot( normal, direction ).div( Math.PI ), skyDensity( direction ) ) : float( 1 );
								const light = skyRadiance( direction ).mul( weight ).toVar();

								gathered.addAssign( light );
								weigh( light, direction );

							} );

						}

					} );

				}

				// shadow ray to a point on an emitter, chosen by resampled importance sampling: candidate
				// points are drawn from the light tree, and one is picked by its unshadowed contribution, see
				// "Importance Resampling for Global Illumination" (Talbot et al., 2005)

				if ( emitterCount > 0 ) {

					const weightSum = float( 0 ).toVar();
					const chosenTarget = float( 0 ).toVar();
					const chosenDistance = float( 0 ).toVar();
					const chosenDirection = vec3( 0 ).toVar();
					const chosenContribution = vec3( 0 ).toVar();
					const chosenScale = float( 0 ).toVar();
					const chosenEmitter = int( 0 ).toVar();
					const chosenPoint = vec2( 0 ).toVar();

					Loop( candidates, ( { i: c } ) => {

						const m = n.mul( candidates ).add( uint( c ) ).toVar();
						const v = fract( vec3( lightOffset, offset.z, offset.w ).add( vec3( float( m.mul( R3[ 0 ] ) ), float( m.mul( R3[ 1 ] ) ), float( m.mul( R3[ 2 ] ) ) ).mul( 2 ** - 32 ) ) ).toVar();

						// descend the light tree by the importance of the children, rescaling the random number

						const node = int( 0 ).toVar();
						const probability = float( 1 ).toVar();
						const u = v.x.toVar();

						if ( treeDepth > 0 ) {

							Loop( treeDepth, () => {

								const link = lightTree.element( node.mul( 3 ).add( 2 ) ).w;

								If( link.greaterThan( 0 ).and( probability.greaterThan( 0 ) ), () => {

									const first = node.add( 1 ).toVar();
									const second = int( link ).toVar();
									const importanceFirst = lightImportance( first, origin, normal ).toVar();
									const sum = importanceFirst.add( lightImportance( second, origin, normal ) ).toVar();

									If( sum.greaterThan( 0 ), () => {

										const p = importanceFirst.div( sum ).toVar();

										If( u.lessThan( p ), () => {

											node.assign( first );
											probability.mulAssign( p );
											u.assign( u.div( p ).min( 0.99999994 ) );

										} ).Else( () => {

											node.assign( second );
											probability.mulAssign( p.oneMinus() );
											u.assign( u.sub( p ).div( p.oneMinus() ).min( 0.99999994 ) );

										} );

									} ).Else( () => {

										probability.assign( 0 );

									} );

								} );

							} );

						}

						If( probability.greaterThan( 0 ), () => {

							const base = int( lightTree.element( node.mul( 3 ).add( 2 ) ).w.negate() ).sub( 1 ).mul( EMITTER_STRIDE ).toVar();
							const corner = emitters.element( base ).toVar();
							const edge1 = emitters.element( base.add( 1 ) ).toVar();
							const edge2 = emitters.element( base.add( 2 ) ).toVar();
							const emission = emitters.element( base.add( 3 ) ).toVar();

							const s = sqrt( v.y );
							const barycoord = vec2( s.mul( v.z.oneMinus() ), s.mul( v.z ) ).toVar();
							const point = corner.xyz.add( edge1.xyz.mul( barycoord.x ) ).add( edge2.xyz.mul( barycoord.y ) );
							const toLight = point.sub( origin ).toVar();
							const distanceSq = dot( toLight, toLight ).max( 1e-8 ).toVar();
							const distance = sqrt( distanceSq ).toVar();
							const direction = toLight.div( distance ).toVar();

							// cosine at the emitter, by its emitting sides

							const cosLight = dot( normalize( cross( edge1.xyz, edge2.xyz ) ), direction ).negate().toVar();
							cosLight.assign( select( edge2.w.equal( 2 ), abs( cosLight ), select( edge2.w.equal( 1 ), cosLight.negate(), cosLight ) ) );

							const cosReceiver = dot( normal, direction ).toVar();

							If( cosReceiver.greaterThan( 0 ).and( cosLight.greaterThan( 0 ) ).and( dot( direction, faceNormal ).greaterThan( 0 ) ), () => {

								// the unshadowed irradiance over the density of the candidate, with the projected solid
								// angle clamped to the hemisphere next to an emitter. Its luminance is the resampling
								// weight, and each candidate is kept with its share of the weight sum

								const scale = cosReceiver.mul( cosLight ).mul( corner.w ).div( distanceSq ).min( Math.PI ).div( probability ).toVar();
								const contribution = emission.rgb.mul( scale ).toVar();
								const target = dot( contribution, vec3( 0.2126, 0.7152, 0.0722 ) ).toVar();

								weightSum.addAssign( target );

								If( hash( seed.add( m.mul( 2654435761 ) ) ).mul( weightSum ).lessThan( target ), () => {

									chosenTarget.assign( target );
									chosenDistance.assign( distance );
									chosenDirection.assign( direction );
									chosenContribution.assign( contribution );
									chosenScale.assign( scale );
									chosenEmitter.assign( base );
									chosenPoint.assign( barycoord );

								} );

							} );

						} );

					} );

					If( chosenTarget.greaterThan( 0 ), () => {

						const transmittance = visibility( origin, chosenDirection, chosenDistance.mul( 0.999 ) ).toVar();

						If( transmittance.greaterThan( 0 ), () => {

							// the emission of the chosen point, with its maps

							const contribution = exactEmitters ? this._emitterRadiance( uint( chosenEmitter ), chosenPoint ).mul( chosenScale ) : chosenContribution;
							const light = contribution.mul( transmittance.mul( weightSum ).div( chosenTarget.mul( candidates ) ) ).toVar();

							direct.addAssign( light );
							weigh( light, chosenDirection );

						} );

					} );

				}

				// shadow ray to the sky, to a cell picked by its power with the alias table and a uniformly
				// distributed direction in the cell

				if ( sky !== null ) {

					const v = fract( skyOffset.add( vec3( float( n.mul( R3[ 0 ] ) ), float( n.mul( R3[ 1 ] ) ), float( n.mul( R3[ 2 ] ) ) ).mul( 2 ** - 32 ) ) ).toVar();

					const scaled = v.x.mul( SKY_COLUMNS * SKY_ROWS ).toVar();
					const index = int( scaled ).min( SKY_COLUMNS * SKY_ROWS - 1 ).toVar();
					const alias = sky.element( index ).toVar();
					const cell = select( fract( scaled ).lessThan( alias.x ), index, int( alias.y ) ).toVar();
					const density = sky.element( cell ).z.toVar();

					const column = float( cell.mod( SKY_COLUMNS ) );
					const row = float( cell.div( SKY_COLUMNS ) );
					const phi = column.add( v.y ).div( SKY_COLUMNS ).sub( 0.5 ).mul( 2 * Math.PI ).toVar();
					const z = mix( sin( row.div( SKY_ROWS ).sub( 0.5 ).mul( Math.PI ) ), sin( row.add( 1 ).div( SKY_ROWS ).sub( 0.5 ).mul( Math.PI ) ), v.z ).toVar();
					const r = sqrt( z.mul( z ).oneMinus().max( 0 ) );
					const direction = normalize( this._environmentInverseRotation.mul( vec3( r.mul( cos( phi ) ), z, r.mul( sin( phi ) ) ) ).xyz ).toVar();
					const cosReceiver = dot( normal, direction ).toVar();

					If( cosReceiver.greaterThan( 0 ).and( density.greaterThan( 0 ) ).and( dot( direction, faceNormal ).greaterThan( 0 ) ), () => {

						const transmittance = visibility( origin, direction, float( 0 ) ).toVar();

						If( transmittance.greaterThan( 0 ), () => {

							const weight = misWeight( density, cosReceiver.div( Math.PI ) );
							const light = skyRadiance( direction ).mul( cosReceiver.mul( weight ).mul( transmittance ).div( density.mul( Math.PI ) ) ).toVar();

							direct.addAssign( light );
							weigh( light, direction );

						} );

					} );

				}

			} );

			// direct light of the directional, point and spot lights with a shadow ray to each one

			if ( analyticLights && this._lightCount > 0 ) {

				const lights = this._lights;

				Loop( this._lightCount, ( { i } ) => {

					const location = lights.element( i.mul( LIGHT_STRIDE ) ).toVar();
					const emission = lights.element( i.mul( LIGHT_STRIDE ).add( 1 ) ).toVar();
					const falloff = lights.element( i.mul( LIGHT_STRIDE ).add( 2 ) ).toVar();
					const axis = lights.element( i.mul( LIGHT_STRIDE ).add( 3 ) ).xyz;

					const isLocal = location.w.greaterThan( 0.5 );
					const toLight = select( isLocal, location.xyz.sub( origin ), location.xyz ).toVar();
					const distance = select( isLocal, length( toLight ), float( 0 ) ).toVar();
					const direction = select( isLocal, toLight.div( distance.max( 1e-8 ) ), toLight ).toVar();
					const cosReceiver = dot( normal, direction ).toVar();

					If( cosReceiver.greaterThan( 0 ).and( dot( direction, faceNormal ).greaterThan( 0 ) ), () => {

						const transmittance = visibility( origin, direction, distance.mul( 0.999 ) ).toVar();

						If( transmittance.greaterThan( 0 ), () => {

							// the distance attenuation of point and spot lights, see getDistanceAttenuation(),
							// and the cone of spot lights, see SpotLightNode

							const cutoff = select( falloff.x.greaterThan( 0 ), distance.div( falloff.x.max( 1e-8 ) ).pow( 4 ).oneMinus().clamp( 0, 1 ).pow2(), float( 1 ) );
							const spot = select( location.w.greaterThan( 1.5 ), smoothstep( falloff.z, falloff.w, dot( direction, axis ) ), float( 1 ) );
							const attenuation = select( isLocal, cutoff.mul( spot ).div( distance.pow( falloff.y ).max( 0.01 ) ), float( 1 ) );

							analytic.addAssign( emission.rgb.mul( cosReceiver.mul( attenuation ).mul( transmittance ) ) );

						} );

					} );

				} );

			}

			if ( directionNode !== null ) directionNode.addAssign( rayDirection.div( rays ) );

			return gathered.add( direct ).div( rays ).add( analytic );

		} )();

	}

}

/**
 * Gathers the irradiance of a {@link RayTracedRadiosity} solver and advances its sample sequence
 * once per render call.
 *
 * @private
 * @augments Node
 */
class RayTracedRadiosityIrradianceNode extends Node {

	static get type() {

		return 'RayTracedRadiosityIrradianceNode';

	}

	/**
	 * Constructs a new ray traced radiosity irradiance node.
	 *
	 * @param {RayTracedRadiosity} radiosity - The radiosity solver.
	 * @param {Node<vec3>} positionNode - The world-space position.
	 * @param {Node<vec3>} normalNode - The world-space normal.
	 * @param {boolean} [analyticLights=false] - Whether to add the direct light of the analytic lights.
	 * @param {?Node<vec3>} [directionNode=null] - A variable to add the luminance-weighted light directions to.
	 */
	constructor( radiosity, positionNode, normalNode, analyticLights = false, directionNode = null ) {

		super( 'vec3' );

		this.radiosity = radiosity;
		this.positionNode = positionNode;
		this.normalNode = normalNode;
		this.analyticLights = analyticLights;
		this.directionNode = directionNode;

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	updateBefore( frame ) {

		this.radiosity._advance( frame );

	}

	setup() {

		return this.radiosity._gather( this.positionNode, this.normalNode, this.analyticLights, this.directionNode );

	}

}

/**
 * Creates a world-space diffuse irradiance sampler for a prepared {@link RayTracedRadiosity}.
 * Call `radiosity.update( renderer, scene )` before creating it. Every render call that uses the
 * sampler continues the ray sequences, so the samples of {@link LightMapper} converge. The direct
 * light of the analytic lights is left to the materials.
 *
 * The sampler adds the luminance-weighted light directions to its optional fourth argument, for
 * the directional light maps of {@link LightMapper}.
 *
 * @param {RayTracedRadiosity} radiosity - The prepared radiosity solver.
 * @return {function(Node<vec3>, Node<vec3>, ?Node<float>, ?Node<vec3>): Node<vec3>} The irradiance sampler.
 */
function rayTracedRadiosityIrradiance( radiosity ) {

	return ( position, normal, sample, direction = null ) => nodeObject( new RayTracedRadiosityIrradianceNode( radiosity, position, normal, false, direction ) );

}

/**
 * Returns the number of pages of the light-mapped meshes of a scene, see `mesh.userData.lightMapPage`.
 *
 * @private
 * @param {Scene} scene - The scene.
 * @return {number} The number of pages.
 */
function countPages( scene ) {

	let pages = 1;

	scene.traverseVisible( ( object ) => {

		if ( object.isMesh === true && object.geometry.hasAttribute( 'uv1' ) ) pages = Math.max( pages, ( object.userData.lightMapPage ?? 0 ) + 1 );

	} );

	return pages;

}

/**
 * Returns the scale and offset of the light map UVs of a page in the tiles of the bounce cache.
 *
 * @private
 * @param {number} page - The page.
 * @param {number} tiles - The number of tiles per side.
 * @return {Vector4} The scale in `x` and `y` and the offset in `z` and `w`.
 */
function getTile( page, tiles ) {

	return new Vector4( 1 / tiles, 1 / tiles, ( page % tiles ) / tiles, Math.floor( page / tiles ) / tiles );

}

/**
 * Returns the transform from the light map UVs of a mesh to the bounce cache: the atlas region of an
 * instance, see {@link lightMapUV}, in the tile of the page of the mesh.
 *
 * @private
 * @param {Mesh} mesh - The mesh.
 * @param {number} instance - The instance.
 * @param {number} tiles - The number of tiles per side of the bounce cache.
 * @return {Vector4} The scale in `x` and `y` and the offset in `z` and `w`.
 */
function lightMapTransform( mesh, instance, tiles ) {

	const geometry = mesh.geometry;
	const scale = mesh.isInstancedMesh === true ? geometry.getAttribute( 'instanceLightMapScale' ) : undefined;
	const offset = mesh.isInstancedMesh === true ? geometry.getAttribute( 'instanceLightMapOffset' ) : undefined;
	const tile = getTile( mesh.userData.lightMapPage ?? 0, tiles );

	const sx = scale !== undefined ? scale.getX( instance ) : 1;
	const sy = scale !== undefined ? scale.getY( instance ) : 1;
	const ox = offset !== undefined ? offset.getX( instance ) : 0;
	const oy = offset !== undefined ? offset.getY( instance ) : 0;

	return tile.set( tile.x * sx, tile.y * sy, tile.x * ox + tile.z, tile.y * oy + tile.w );

}

/**
 * Returns a tangent and bitangent around a unit vector, see "Building an Orthonormal Basis,
 * Revisited" (Duff et al., 2017).
 *
 * @private
 * @param {Node<vec3>} normal - The unit vector.
 * @return {Array<Node<vec3>>} The tangent and bitangent.
 */
function orthonormalBasis( normal ) {

	const signZ = select( normal.z.greaterThanEqual( 0 ), float( 1 ), float( - 1 ) );
	const a = float( - 1 ).div( signZ.add( normal.z ) );
	const b = normal.x.mul( normal.y ).mul( a );
	const tangent = vec3( normal.x.mul( normal.x ).mul( a ).mul( signZ ).add( 1 ), b.mul( signZ ), normal.x.mul( signZ ).negate() ).toVar();
	const bitangent = vec3( b, normal.y.mul( normal.y ).mul( a ).add( signZ ), normal.y.negate() ).toVar();

	return [ tangent, bitangent ];

}

/**
 * Builds a light tree over emitters, with depth-first nodes where the first child follows its parent.
 * The nodes split the emitters at the median of their centroids along the widest extent.
 *
 * @private
 * @param {Array<Object>} items - The bounds, power and cone of emitted directions of the emitters.
 * @return {{nodes: StorageBufferNode, depth: number, count: number}} The tree.
 */
function createLightTree( items ) {

	const nodes = [];
	let depth = 0;

	const build = ( list, level ) => {

		const node = { min: list[ 0 ].min.clone(), max: list[ 0 ].max.clone(), power: 0, axis: list[ 0 ].axis.clone(), cosTheta: list[ 0 ].cosTheta, link: - 1 };
		const centroids = new Box3();

		for ( const item of list ) {

			node.min.min( item.min );
			node.max.max( item.max );
			node.power += item.power;
			unionCone( node, item );
			centroids.expandByPoint( item.centroid );

		}

		const index = nodes.length;
		nodes.push( node );
		depth = Math.max( depth, level );

		if ( list.length === 1 ) {

			node.link = - ( list[ 0 ].index + 1 );
			return index;

		}

		const size = centroids.getSize( _a );
		const axis = size.x > size.y && size.x > size.z ? 'x' : ( size.y > size.z ? 'y' : 'z' );

		list.sort( ( l, r ) => l.centroid[ axis ] - r.centroid[ axis ] );

		const middle = list.length >> 1;

		build( list.slice( 0, middle ), level + 1 );
		node.link = build( list.slice( middle ), level + 1 );

		return index;

	};

	if ( items.length > 0 ) build( items.slice(), 0 );

	const tree = [];

	for ( const { min, max, power, axis, cosTheta, link } of nodes ) {

		tree.push( min.x, min.y, min.z, power, max.x, max.y, max.z, cosTheta, axis.x, axis.y, axis.z, link );

	}

	return { nodes: vec4Storage( tree ), depth, count: items.length };

}

/**
 * Grows a cone of directions to contain another cone, see "Physically Based Rendering: From Theory
 * to Implementation", 4th edition, section 3.8.4 (Pharr et al., 2023).
 *
 * @private
 * @param {Object} cone - The cone with an `axis` and `cosTheta` of its spread angle, grown in place.
 * @param {Object} other - The other cone.
 */
function unionCone( cone, other ) {

	if ( cone.cosTheta === - 1 ) return;

	if ( other.cosTheta === - 1 ) {

		cone.cosTheta = - 1;
		return;

	}

	const thetaA = Math.acos( Math.min( cone.cosTheta, 1 ) );
	const thetaB = Math.acos( Math.min( other.cosTheta, 1 ) );
	const thetaD = cone.axis.angleTo( other.axis );

	if ( Math.min( thetaD + thetaB, Math.PI ) <= thetaA ) return;

	if ( Math.min( thetaD + thetaA, Math.PI ) <= thetaB ) {

		cone.axis.copy( other.axis );
		cone.cosTheta = other.cosTheta;
		return;

	}

	const theta = ( thetaA + thetaD + thetaB ) / 2;
	const pivot = _normal.crossVectors( cone.axis, other.axis );

	if ( theta >= Math.PI || pivot.lengthSq() < 1e-12 ) {

		cone.cosTheta = - 1;
		return;

	}

	cone.axis.applyAxisAngle( pivot.normalize(), theta - thetaA );
	cone.cosTheta = Math.cos( theta );

}

/**
 * Returns whether a texture can be a layer of the material texture array: a loaded 2D texture.
 *
 * @private
 * @param {?Texture} map - The texture.
 * @return {boolean} Whether the texture can be resampled.
 */
function isMap( map ) {

	if ( map === null || map === undefined || map.isTexture !== true ) return false;
	if ( map.isCubeTexture === true || map.isArrayTexture === true || map.isDataArrayTexture === true || map.isData3DTexture === true || map.isCompressedArrayTexture === true ) return false;

	const image = map.image;

	return image !== null && image !== undefined && ( image.width > 0 || image.videoWidth > 0 );

}

/**
 * Returns the average linear color of a texture image, white without a texture or for images that
 * can not be drawn to a canvas.
 *
 * @private
 * @param {?Texture} texture - The texture.
 * @return {Color} The average color.
 */
function getAverageColor( texture ) {

	if ( texture === null || texture === undefined ) return _white;

	if ( _averageColors.has( texture ) === false ) {

		const color = new Color( 1, 1, 1 );
		const image = texture.image;

		if ( image !== null && image !== undefined && image.width > 0 && image.data === undefined && typeof OffscreenCanvas !== 'undefined' ) {

			// a small downscaled copy, averaged after the conversion to linear values

			const size = 32;
			const context = new OffscreenCanvas( size, size ).getContext( '2d' );
			context.drawImage( image, 0, 0, size, size );

			const data = context.getImageData( 0, 0, size, size ).data;
			const texel = new Color();
			const sum = new Color( 0, 0, 0 );

			for ( let i = 0; i < data.length; i += 4 ) {

				sum.add( texel.setRGB( data[ i ] / 255, data[ i + 1 ] / 255, data[ i + 2 ] / 255, texture.colorSpace === SRGBColorSpace ? SRGBColorSpace : undefined ) );

			}

			color.copy( sum ).multiplyScalar( 4 / data.length );

		}

		_averageColors.set( texture, color );

	}

	return _averageColors.get( texture );

}

/**
 * Creates a read-only storage buffer of vec4 values.
 *
 * @private
 * @param {Array<number>} data - The values, four per item.
 * @return {StorageBufferNode} The storage buffer.
 */
function vec4Storage( data ) {

	const array = new Float32Array( Math.max( data.length, 8 ) );
	array.set( data );

	return storage( new StorageBufferAttribute( array, 4 ), 'vec4', array.length / 4 ).toReadOnly();

}

/**
 * Builds the alias table that samples a sky by the power of its latitude-longitude cells, see
 * "A Linear Algorithm for Generating Random Numbers with a Given Distribution" (Vose, 1991).
 * Every cell stores the probability to keep it, its alias and its density over the solid angle.
 *
 * @private
 * @param {Texture} environment - The sky texture.
 * @return {?StorageBufferNode} The table, or `null` if the texture data is not available on the CPU.
 */
function createSkyTable( environment ) {

	const image = environment.image;

	if ( environment.isCubeTexture === true || image === null || image === undefined || ! image.data ) return null;

	const { data, width, height } = image;
	const channels = data.length / ( width * height );

	if ( channels !== 3 && channels !== 4 ) return null;

	const read = environment.type === HalfFloatType ? ( i ) => DataUtils.fromHalfFloat( data[ i ] ) : environment.type === UnsignedByteType ? ( i ) => data[ i ] / 255 : ( i ) => data[ i ];

	// the mean luminance of the cells, the rows go up like the texture coordinates of equirectUV()

	const cells = SKY_COLUMNS * SKY_ROWS;
	const power = new Float64Array( cells );
	const counts = new Uint32Array( cells );

	for ( let y = 0; y < height; y ++ ) {

		const v = environment.flipY ? 1 - ( y + 0.5 ) / height : ( y + 0.5 ) / height;
		const row = Math.min( Math.floor( v * SKY_ROWS ), SKY_ROWS - 1 );

		for ( let x = 0; x < width; x ++ ) {

			const i = ( y * width + x ) * channels;
			const cell = row * SKY_COLUMNS + Math.min( Math.floor( ( x + 0.5 ) / width * SKY_COLUMNS ), SKY_COLUMNS - 1 );

			power[ cell ] += 0.2126 * read( i ) + 0.7152 * read( i + 1 ) + 0.0722 * read( i + 2 );
			counts[ cell ] ++;

		}

	}

	// the power of a cell is its mean luminance times its solid angle

	const solidAngles = new Float64Array( SKY_ROWS );

	for ( let row = 0; row < SKY_ROWS; row ++ ) {

		solidAngles[ row ] = 2 * Math.PI / SKY_COLUMNS * ( Math.sin( ( ( row + 1 ) / SKY_ROWS - 0.5 ) * Math.PI ) - Math.sin( ( row / SKY_ROWS - 0.5 ) * Math.PI ) );

	}

	let total = 0;

	for ( let i = 0; i < cells; i ++ ) {

		const value = counts[ i ] > 0 ? power[ i ] / counts[ i ] * solidAngles[ Math.floor( i / SKY_COLUMNS ) ] : 0;

		power[ i ] = value > 0 && Number.isFinite( value ) ? value : 0;
		total += power[ i ];

	}

	if ( total === 0 ) return null;

	// cells less likely than average are kept with their scaled probability and otherwise replaced by
	// a more likely alias, which gives away the remaining probability

	const table = new Float32Array( cells * 4 );
	const scaled = new Float64Array( cells );
	const small = [], large = [];

	for ( let i = 0; i < cells; i ++ ) {

		scaled[ i ] = power[ i ] / total * cells;
		table[ i * 4 + 2 ] = power[ i ] / total / solidAngles[ Math.floor( i / SKY_COLUMNS ) ];

		( scaled[ i ] < 1 ? small : large ).push( i );

	}

	while ( small.length > 0 && large.length > 0 ) {

		const less = small.pop();
		const more = large.pop();

		table[ less * 4 ] = scaled[ less ];
		table[ less * 4 + 1 ] = more;

		scaled[ more ] += scaled[ less ] - 1;
		( scaled[ more ] < 1 ? small : large ).push( more );

	}

	for ( const i of small.concat( large ) ) {

		table[ i * 4 ] = 1;
		table[ i * 4 + 1 ] = i;

	}

	return vec4Storage( table );

}

export { RayTracedRadiosity, rayTracedRadiosityIrradiance };
