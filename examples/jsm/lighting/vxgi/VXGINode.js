import { RenderTarget, Vector2, Vector3, TempNode, QuadMesh, NodeMaterial, RendererUtils, HalfFloatType, RGBAFormat, RedFormat, UnsignedByteType } from 'three/webgpu';
import { Fn, NodeUpdateType, uniform, reference, vec2, vec3, vec4, float, uint, uv, mix, passTexture, getViewPosition, getNormalFromDepth, logarithmicDepthToViewZ, viewZToPerspectiveDepth, screenCoordinate, interleavedGradientNoise, normalize, cross, abs, select, sqrt, fract, floor, cos, sin, exp2, pow, PI, Loop, If, Break, property, outputStruct, context } from 'three/tsl';

import { VXGIVolume } from './VXGIVolume.js';
import { createConeTracer, intersectVolume, sampleDirectional } from './VXGIConeTracer.js';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

const TEMPORAL_SHIFT = 5.588238;
const TEMPORAL_CYCLE = 64;

let _rendererState;

const _neutralContext = /*@__PURE__*/ context();

/**
 * Post processing node for voxel based global illumination. The scene is voxelized into a
 * {@link VXGIVolume} and indirect diffuse light and ambient occlusion are gathered per
 * pixel with approximate voxel cone tracing.
 *
 * The node is a middle path between SSGI and Light Probe Grids:
 *
 * - Compared to `SSGINode` it is free of screen-space artifacts and provides noticeably more
 *   consistent lighting, since off-screen surfaces and thin occluders contribute.
 *   However, it is less dynamic: objects should stay static, because geometry changes require
 *   a re-voxelization (`needsUpdate = true`) which is too expensive for per-frame animation.
 * - Compared to `LightProbeGrid` it supports dynamic lighting without a new baking process and
 *   produces a better overall lighting quality with less light bleeding. However, it is more
 *   expensive and therefore less suitable for performance restricted use cases.
 *
 * The quality/performance of the effect mainly depend on the voxel resolution, the number of cones
 * traced per pixel as well as the apeture of the cones.
 *
 * Lights and their shadow maps are picked up automatically. Only direct lights are injected.
 *
 * References:
 * - {@link https://research.nvidia.com/publication/2011-09_interactive-indirect-illumination-using-voxel-cone-tracing}:
 *   Crassin et al., Interactive Indirect Illumination Using Voxel Cone Tracing, Pacific Graphics 2011.
 *
 * Note: This node can only be used with `WebGPURenderer` and a WebGPU backend.
 *
 * @augments TempNode
 * @three_import import { vxgi } from 'three/addons/lighting/vxgi/VXGINode.js';
 */
class VXGINode extends TempNode {

	static get type() {

		return 'VXGINode';

	}

	/**
	 * Constructs a new voxel GI node.
	 *
	 * @param {TextureNode} depthNode - A texture node that represents the scene's depth.
	 * @param {?TextureNode} normalNode - A texture node that represents the scene's view space normals.
	 * @param {Scene} scene - The scene to voxelize.
	 * @param {Camera} camera - The camera the scene is rendered with.
	 * @param {number} [resolution=128] - Number of voxels along the longest axis of the volume. Should not exceed `256`, higher values exceed the maximum storage buffer size of the voxelizer.
	 */
	constructor( depthNode, normalNode, scene, camera, resolution = 128 ) {

		super( 'vec4' );

		/**
		 * A node that represents the scene's depth.
		 *
		 * @type {TextureNode}
		 */
		this.depthNode = depthNode;

		/**
		 * A node that represents the scene's normals. If `null`, normals are reconstructed from depth.
		 *
		 * @type {?TextureNode}
		 */
		this.normalNode = normalNode;

		/**
		 * The scene to voxelize.
		 *
		 * @type {Scene}
		 */
		this.scene = scene;

		/**
		 * The camera the scene is rendered with.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;

		/**
		 * The voxel volume. Use it to configure bounds, layers and bounces.
		 *
		 * @type {VXGIVolume}
		 */
		this.volume = new VXGIVolume( resolution );

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * Number of cones traced per pixel. Should be in the range `[2, 8]`.
		 *
		 * Mainly defines the quality and precision of the Voxel Cone Tracing. A value of
		 * `2` - `4` is the recommended setting. Use `2` for performance restricted use cases.
		 *
		 * @type {UniformNode<uint>}
		 * @default 3
		 */
		this.coneCount = uniform( 3, 'uint' );

		/**
		 * Aperture of the diffuse cones in degrees. Wider cones are faster (fewer steps) but leak
		 * and over-occlude more, narrow cones are more precise but noisier and take more steps.
		 * Choose it together with {@link VXGINode#coneCount}. Should be in the range `[10, 90]`.
		 *
		 * @type {UniformNode<float>}
		 * @default 40
		 */
		this.coneAngle = uniform( 40 );

		/**
		 * Intensity of the indirect diffuse irradiance.
		 *
		 * @type {UniformNode<float>}
		 * @default 1
		 */
		this.giIntensity = uniform( 1 );

		/**
		 * Power function applied to AO to make it appear darker/lighter.
		 *
		 * @type {UniformNode<float>}
		 * @default 1
		 */
		this.aoIntensity = uniform( 1 );

		/**
		 * The darkest value the ambient occlusion can reach. Lifts creases and contact regions out
		 * of pure black, which voxel-traced occlusion tends to overestimate at the resolution of
		 * a voxel. `0` keeps the full occlusion range.
		 *
		 * @type {UniformNode<float>}
		 * @default 0
		 */
		this.aoMinVisibility = uniform( 0 );

		/**
		 * Occlusion is weighted by `1 / ( 1 + distance / aoDistance )` for AO, so occluders at this
		 * world-space distance count half. `0` disables the falloff.
		 *
		 * @type {UniformNode<float>}
		 * @default 1
		 */
		this.aoDistance = uniform( 1 );

		/**
		 * Offset of the cone origins along the surface normal in voxels. The surface's own voxel
		 * can extend up to half a voxel above the surface and the trilinear footprint of a sample
		 * spans another half voxel, so 1.5 voxels avoid self-occlusion in every case.
		 *
		 * @type {UniformNode<float>}
		 * @default 1.5
		 */
		this.normalOffset = uniform( 1.5 );

		/**
		 * Debug visualization of the volume: `0` = off, `1` = radiance voxels, `2` = per-axis opacity voxels.
		 * The visualization replaces the GI output.
		 *
		 * @type {UniformNode<int>}
		 * @default 0
		 */
		this.debug = uniform( 0, 'int' );

		/**
		 * The mip level shown by the debug visualization.
		 *
		 * @type {UniformNode<float>}
		 * @default 0
		 */
		this.debugLevel = uniform( 0 );

		/**
		 * Whether to use temporal filtering or not. Setting this property to `true` requires the
		 * usage of `TRAANode`. Cone directions are then rotated per frame to converge the noise.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.useTemporalFiltering = true;

		// private uniforms

		this._resolution = uniform( new Vector2() );
		this._frame = uniform( 0 );
		this._cameraProjectionMatrix = uniform( camera.projectionMatrix );
		this._cameraProjectionMatrixInverse = uniform( camera.projectionMatrixInverse );
		this._cameraWorldMatrix = uniform( camera.matrixWorld );
		this._cameraPosition = uniform( new Vector3() ).onRenderUpdate( ( _, self ) => self.value.setFromMatrixPosition( camera.matrixWorld ) );
		this._cameraNear = reference( 'near', 'float', camera );
		this._cameraFar = reference( 'far', 'float', camera );

		/**
		 * The render target the effect is rendered into. The first texture holds the AO,
		 * the second one the GI.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._renderTarget = new RenderTarget( 1, 1, { depthBuffer: false, count: 2 } );

		const aoTexture = this._renderTarget.textures[ 0 ];
		aoTexture.name = 'VXGI.AO';
		aoTexture.type = UnsignedByteType;
		aoTexture.format = RedFormat;

		const giTexture = this._renderTarget.textures[ 1 ];
		giTexture.name = 'VXGI.GI';
		giTexture.type = HalfFloatType;
		giTexture.format = RGBAFormat;

		this._material = new NodeMaterial();
		this._material.name = 'VXGI';

		// the shared context of the last build and the directional setting the material was built with

		this._sharedContext = null;
		this._directional = null;

		this._aoNode = passTexture( this, aoTexture );
		this._giNode = passTexture( this, giTexture );

	}

	/**
	 * Number of cached indirect bounces. See {@link VXGIVolume#bounces}.
	 *
	 * @type {number}
	 */
	get bounces() {

		return this.volume.bounces;

	}

	set bounces( value ) {

		this.volume.bounces = value;
		this.volume.lightingNeedsUpdate = true;

	}

	/**
	 * Whether the coarser radiance levels are filtered directionally to reduce light bleeding
	 * through thin walls and floors. Off by default since it costs memory and performance.
	 * See {@link VXGIVolume#directionalRadiance}.
	 *
	 * @type {boolean}
	 */
	get directionalRadiance() {

		return this.volume.directionalRadiance;

	}

	set directionalRadiance( value ) {

		this.volume.directionalRadiance = value;

	}

	/**
	 * Set to `true` to re-voxelize the scene in the next frame.
	 *
	 * @type {boolean}
	 */
	get needsUpdate() {

		return this.volume.needsUpdate;

	}

	set needsUpdate( value ) {

		this.volume.needsUpdate = value;

	}

	/**
	 * Set to `true` to re-inject lighting in the next frame.
	 *
	 * @type {boolean}
	 */
	get lightingNeedsUpdate() {

		return this.volume.lightingNeedsUpdate;

	}

	set lightingNeedsUpdate( value ) {

		this.volume.lightingNeedsUpdate = value;

	}

	/**
	 * Returns the AO result of the effect as a texture node.
	 *
	 * @return {PassTextureNode} A texture node that represents the AO result of the effect.
	 */
	getAONode() {

		return this._aoNode;

	}

	/**
	 * Returns the GI result of the effect as a texture node. The texture holds the indirect
	 * diffuse irradiance, ready to be added to the lighting via `builtinGIContext()`.
	 *
	 * @return {PassTextureNode} A texture node that represents the GI result of the effect.
	 */
	getGINode() {

		return this._giNode;

	}

	/**
	 * Sets the size of the effect.
	 *
	 * @param {number} width - The width of the effect.
	 * @param {number} height - The height of the effect.
	 */
	setSize( width, height ) {

		this._resolution.value.set( width, height );
		this._renderTarget.setSize( width, height );

	}

	/**
	 * This method is used to render the effect once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		// this node is usually updated while a scene pass renders whose context injects the
		// AO/GI of this node into the materials; the nested renders below must not inherit it

		const currentContextNode = renderer.contextNode;
		renderer.contextNode = _neutralContext;

		//

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		// voxelization and light injection

		this.volume.update( renderer, this.scene );

		// the sampling code depends on the volume's directional setting

		if ( this._sharedContext !== null && this._directional !== this.volume.directionalRadiance ) {

			this._setupMaterial( renderer );

		}

		// update temporal uniforms

		if ( this.useTemporalFiltering === true ) {

			this._frame.value = frame.frameId % TEMPORAL_CYCLE;

		} else {

			this._frame.value = 0;

		}

		//

		_quadMesh.material = this._material;
		_quadMesh.name = 'VXGI';

		// clear (white for the AO attachment)

		renderer.setClearColor( 0xffffff, 1 );

		renderer.setRenderTarget( this._renderTarget );
		_quadMesh.render( renderer );

		// restore

		renderer.contextNode = currentContextNode;

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		this._sharedContext = builder.getSharedContext();
		this._setupMaterial( builder.renderer );

		return this._aoNode;

	}

	/**
	 * Builds the TSL code of the effect into the internal pass material.
	 *
	 * @private
	 * @param {Renderer} renderer - The renderer.
	 */
	_setupMaterial( renderer ) {

		const volume = this.volume;
		const directional = this._directional = volume.directionalRadiance;
		const uvNode = uv();

		const sampleDepth = ( uv ) => {

			const depth = this.depthNode.sample( uv ).r;

			if ( renderer.logarithmicDepthBuffer === true ) {

				const viewZ = logarithmicDepthToViewZ( depth, this._cameraNear, this._cameraFar );

				return viewZToPerspectiveDepth( viewZ, this._cameraNear, this._cameraFar );

			}

			return depth;

		};

		const sampleNormal = ( uv ) => ( this.normalNode !== null ) ? this.normalNode.sample( uv ).rgb.normalize() : getNormalFromDepth( uv, this.depthNode.value, this._cameraProjectionMatrixInverse );

		const voxelSize = volume.voxelSizeNode;
		const projectionMatrixInverse = this._cameraProjectionMatrixInverse;

		const trace = createConeTracer( volume, {
			radianceNode: volume.radianceNode,
			directionalNode: directional === true ? volume.directionalNode : null
		} );

		const aoField = property( 'float' );
		const giField = property( 'vec4' );

		const outputNode = outputStruct( aoField, giField );

		const gi = Fn( () => {

			const depth = sampleDepth( uvNode ).toConst();

			depth.greaterThanEqual( 1.0 ).discard();

			const viewPosition = getViewPosition( uvNode, depth, projectionMatrixInverse ).toConst();
			const worldPosition = this._cameraWorldMatrix.mul( vec4( viewPosition, 1 ) ).xyz.toConst();
			const viewNormal = sampleNormal( uvNode ).toConst();
			const worldNormal = normalize( this._cameraWorldMatrix.mul( vec4( viewNormal, 0 ) ).xyz ).toConst();

			// interleaved gradient noise for both values: its spatial structure converges well under temporal filtering

			const temporalShift = this._frame.mul( TEMPORAL_SHIFT ).toConst();
			const rotationNoise = interleavedGradientNoise( screenCoordinate.add( temporalShift ) ).toConst();
			const elevationNoise = interleavedGradientNoise( screenCoordinate.add( temporalShift ).add( vec2( 5.588238, 3.14159 ) ) ).toConst();

			// tangent frame

			const up = select( abs( worldNormal.y ).lessThan( 0.99 ), vec3( 0, 1, 0 ), vec3( 1, 0, 0 ) );
			const tangent = normalize( cross( worldNormal, up ) ).toConst();
			const bitangent = cross( worldNormal, tangent ).toConst();

			const CONE_COUNT = this.coneCount.toConst();
			const tanHalfAngle = this.coneAngle.mul( 0.5 ).radians().tan().toConst();
			const traceDistance = volume.traceDistanceNode;
			const aoDistance = this.aoDistance;
			const originOffset = worldNormal.mul( voxelSize.mul( this.normalOffset ) ).toConst();

			const color = vec3( 0 ).toVar();
			const occlusion = float( 0 ).toVar();

			Loop( { start: uint( 0 ), end: CONE_COUNT, type: 'uint', condition: '<', name: 'c' }, ( { c } ) => {

				// stratified cosine-weighted directions

				const u1 = float( c ).add( elevationNoise ).div( float( CONE_COUNT ) ).toConst();
				const u2 = fract( float( c ).mul( 0.618034 ).add( rotationNoise ) ).toConst();
				const sinTheta = sqrt( u1 ).toConst();
				const cosTheta = sqrt( u1.oneMinus() ).toConst();
				const phi = u2.mul( PI.mul( 2 ) ).toConst();

				const direction = normalize( tangent.mul( cos( phi ).mul( sinTheta ) ).add( bitangent.mul( sin( phi ).mul( sinTheta ) ) ).add( worldNormal.mul( cosTheta ) ) ).toConst();
				const origin = worldPosition.add( originOffset ).toConst();

				const cone = trace( origin, direction, tanHalfAngle, traceDistance, aoDistance );

				color.addAssign( cone.color );
				occlusion.addAssign( cone.ao );

			} );

			// the mean radiance over the cosine-weighted hemisphere times PI is the irradiance

			color.divAssign( float( CONE_COUNT ) );
			color.mulAssign( this.giIntensity.mul( PI ) );

			const ao = mix( this.aoMinVisibility, float( 1 ), pow( occlusion.div( float( CONE_COUNT ) ).oneMinus().clamp(), this.aoIntensity ) ).toVar();

			// debug visualization: march the voxels from the camera

			If( this.debug.greaterThan( 0 ), () => {

				const cameraPosition = this._cameraPosition;
				const direction = normalize( worldPosition.sub( cameraPosition ) ).toConst();
				const surfaceDistance = worldPosition.sub( cameraPosition ).length().toConst();
				const level = this.debugLevel.toConst();
				const texel = voxelSize.mul( exp2( level ) ).toConst();
				const levelSize = volume.volumeSizeNode.div( texel ).toConst();
				const boundsMin = volume.boundsMinNode;

				const { tEnter, tExit } = intersectVolume( volume, cameraPosition, direction );
				const tMax = tExit.min( surfaceDistance ).toConst();
				const t = tEnter.toVar();

				color.assign( 0 );
				ao.assign( 1 );

				Loop( { start: 0, end: 512, type: 'int', condition: '<', name: 's' }, () => {

					If( t.greaterThanEqual( tMax ), () => {

						Break();

					} );

					const uvw = cameraPosition.add( direction.mul( t ) ).sub( boundsMin ).div( volume.volumeSizeNode );
					const snapped = floor( uvw.mul( levelSize ) ).add( 0.5 ).div( levelSize ).toConst();

					If( this.debug.equal( 1 ), () => {

						let radiance;

						if ( directional === false ) {

							radiance = volume.radianceNode.sample( snapped ).level( level ).toConst();

						} else {

							radiance = vec4( 0 ).toVar();

							If( level.lessThan( 1 ), () => {

								radiance.assign( volume.radianceNode.sample( snapped ).level( float( 0 ) ) );

							} ).Else( () => {

								radiance.assign( sampleDirectional( volume, volume.directionalNode, snapped, level.sub( 1 ), direction ) );

							} );

						}

						If( radiance.a.greaterThan( 0.01 ), () => {

							color.assign( radiance.rgb.div( radiance.a ) );
							Break();

						} );

					} ).Else( () => {

						const opacity = volume.opacityNode.sample( snapped ).level( level ).toConst();

						If( opacity.w.greaterThan( 0.01 ), () => {

							color.assign( opacity.xyz );
							Break();

						} );

					} );

					t.addAssign( texel.mul( 0.25 ) );

				} );

			} );

			aoField.assign( ao );
			giField.assign( vec4( color, 1 ) );

			return vec4( 0 );

		} );

		this._material.contextNode = context( this._sharedContext );
		this._material.colorNode = gi();
		this._material.outputNode = outputNode;
		this._material.needsUpdate = true;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		super.dispose();

		this._renderTarget.dispose();
		this._material.dispose();
		this.volume.dispose();

	}

}

export default VXGINode;

/**
 * TSL function for creating a voxel GI effect.
 *
 * @tsl
 * @function
 * @param {TextureNode} depthNode - A texture node that represents the scene's depth.
 * @param {?TextureNode} normalNode - A texture node that represents the scene's view space normals.
 * @param {Scene} scene - The scene to voxelize.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @param {number} [resolution=128] - Number of voxels along the longest axis of the volume. Should not exceed `256`, higher values exceed the maximum storage buffer size of the voxelizer.
 * @returns {VXGINode}
 */
export const vxgi = ( depthNode, normalNode, scene, camera, resolution ) => new VXGINode( depthNode, normalNode, scene, camera, resolution );
