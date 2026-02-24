import { RenderTarget, Vector2, TempNode, QuadMesh, NodeMaterial, RendererUtils, MathUtils } from 'three/webgpu';
import { clamp, normalize, reference, Fn, NodeUpdateType, uniform, vec4, passTexture, uv, logarithmicDepthToViewZ, viewZToPerspectiveDepth, getViewPosition, screenCoordinate, float, sub, fract, dot, vec2, rand, vec3, Loop, mul, PI, cos, sin, uint, cross, acos, sign, pow, luminance, If, max, abs, Break, sqrt, HALF_PI, div, ceil, shiftRight, convertToTexture, bool, getNormalFromDepth, countOneBits, interleavedGradientNoise } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

// From Activision GTAO paper: https://www.activision.com/cdn/research/s2016_pbs_activision_occlusion.pptx
const _temporalRotations = [ 60, 300, 180, 240, 120, 0 ];
const _spatialOffsets = [ 0, 0.5, 0.25, 0.75 ];

let _rendererState;

/**
 * Post processing node for applying Screen Space Global Illumination (SSGI) to a scene.
 *
 * References:
 * - {@link https://github.com/cdrinmatane/SSRT3}.
 * - {@link https://cdrinmatane.github.io/posts/ssaovb-code/}.
 * - {@link https://cdrinmatane.github.io/cgspotlight-slides/ssilvb_slides.pdf}.
 *
 * The quality and performance of the effect mainly depend on `sliceCount` and `stepCount`.
 * The total number of samples taken per pixel is `sliceCount` * `stepCount` * `2`. Here are some
 * recommended presets depending on whether temporal filtering is used or not.
 *
 * With temporal filtering (recommended):
 *
 * - Low: `sliceCount` of `1`, `stepCount` of `12`.
 * - Medium: `sliceCount` of `2`, `stepCount` of `8`.
 * - High: `sliceCount` of `3`, `stepCount` of `16`.
 *
 * Use for a higher slice count if you notice temporal instabilities like flickering. Reduce the sample
 * count then to mitigate the performance lost.
 *
 * Without temporal filtering:
 *
 * - Low: `sliceCount` of `2`, `stepCount` of `6`.
 * - Medium: `sliceCount` of `3`, `stepCount` of `8`.
 * - High: `sliceCount` of `4`, `stepCount` of `12`.
 *
 * @augments TempNode
 * @three_import import { ssgi } from 'three/addons/tsl/display/SSGINode.js';
 */
class SSGINode extends TempNode {

	static get type() {

		return 'SSGINode';

	}

	/**
	 * Constructs a new SSGI node.
	 *
	 * @param {TextureNode} beautyNode - A texture node that represents the beauty or scene pass.
	 * @param {TextureNode} depthNode - A texture node that represents the scene's depth.
	 * @param {TextureNode} normalNode - A texture node that represents the scene's normals.
	 * @param {PerspectiveCamera} camera - The camera the scene is rendered with.
	 */
	constructor( beautyNode, depthNode, normalNode, camera ) {

		super( 'vec4' );

		/**
		 * A texture node that represents the beauty or scene pass.
		 *
		 * @type {TextureNode}
		 */
		this.beautyNode = beautyNode;

		/**
		 * A node that represents the scene's depth.
		 *
		 * @type {TextureNode}
		 */
		this.depthNode = depthNode;

		/**
		 * A node that represents the scene's normals. If no normals are passed to the
		 * constructor (because MRT is not available), normals can be automatically
		 * reconstructed from depth values in the shader.
		 *
		 * @type {TextureNode}
		 */
		this.normalNode = normalNode;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * Number of per-pixel hemisphere slices. This has a big performance cost and should be kept as low as possible.
		 * Should be in the range `[1, 4]`.
		 *
		 * @type {UniformNode<uint>}
		 * @default 1
		 */
		this.sliceCount = uniform( 1, 'uint' );

		/**
		 * Number of samples taken along one side of a given hemisphere slice. This has a big performance cost and should
		 * be kept as low as possible.  Should be in the range `[1, 32]`.
		 *
		 * @type {UniformNode<uint>}
		 * @default 12
		 */
		this.stepCount = uniform( 12, 'uint' );

		/**
		 * Power function applied to AO to make it appear darker/lighter. Should be in the range `[0, 4]`.
		 *
		 * @type {UniformNode<float>}
		 * @default 1
		 */
		this.aoIntensity = uniform( 1, 'float' );

		/**
		 * Intensity of the indirect diffuse light. Should be in the range `[0, 100]`.
		 *
		 * @type {UniformNode<float>}
		 * @default 10
		 */
		this.giIntensity = uniform( 10, 'float' );

		/**
		 * Effective sampling radius in world space. AO and GI can only have influence within that radius.
		 * Should be in the range `[1, 25]`.
		 *
		 * @type {UniformNode<float>}
		 * @default 12
		 */
		this.radius = uniform( 12, 'float' );

		/**
		 * Makes the sample distance in screen space instead of world-space (helps having more detail up close).
		 *
		 * @type {UniformNode<bool>}
		 * @default false
		 */
		this.useScreenSpaceSampling = uniform( true, 'bool' );

		/**
		 * Controls samples distribution. It's an exponent applied at each step get increasing step size over the distance.
		 * Should be in the range `[1, 3]`.
		 *
		 * @type {UniformNode<float>}
		 * @default 2
		 */
		this.expFactor = uniform( 2, 'float' );

		/**
		 * Constant thickness value of objects on the screen in world units. Allows light to pass behind surfaces past that thickness value.
		 * Should be in the range `[0.01, 10]`.
		 *
		 * @type {UniformNode<float>}
		 * @default 1
		 */
		this.thickness = uniform( 1, 'float' );

		/**
		 * Whether to increase thickness linearly over distance or not (avoid losing detail over the distance).
		 *
		 * @type {UniformNode<bool>}
		 * @default false
		 */
		this.useLinearThickness = uniform( false, 'bool' );

		/**
		 * How much light backface surfaces emit.
		 * Should be in the range `[0, 1]`.
		 *
		 * @type {UniformNode<float>}
		 * @default 0
		 */
		this.backfaceLighting = uniform( 0, 'float' );

		/**
		 * Whether to use temporal filtering or not. Setting this property to
		 * `true` requires the usage of `TRAANode`. This will help to reduce noise
		 * although it introduces typical TAA artifacts like ghosting and temporal
		 * instabilities.
		 *
		 * If setting this property to `false`, a manual denoise via `DenoiseNode`
		 * is required.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.useTemporalFiltering = true;

		// private uniforms

		/**
		 * The resolution of the effect.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._resolution = uniform( new Vector2() );

		/**
		 * Used to compute the effective step radius when viewSpaceSampling is `false`.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._halfProjScale = uniform( 1 );

		/**
		 * Temporal direction that influences the rotation angle for each slice.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._temporalDirection = uniform( 0 );

		/**
		 * Temporal offset added to the initial ray step.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._temporalOffset = uniform( 0 );

		/**
		 * Represents the projection matrix of the scene's camera.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraProjectionMatrix = uniform( camera.projectionMatrix );

		/**
		 * Represents the inverse projection matrix of the scene's camera.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraProjectionMatrixInverse = uniform( camera.projectionMatrixInverse );

		/**
		 * Represents the near value of the scene's camera.
		 *
		 * @private
		 * @type {ReferenceNode<float>}
		 */
		this._cameraNear = reference( 'near', 'float', camera );

		/**
		 * Represents the far value of the scene's camera.
		 *
		 * @private
		 * @type {ReferenceNode<float>}
		 */
		this._cameraFar = reference( 'far', 'float', camera );

		/**
		 * A reference to the scene's camera.
		 *
		 * @private
		 * @type {PerspectiveCamera}
		 */
		this._camera = camera;

		/**
		 * The render target the GI is rendered into.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._ssgiRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._ssgiRenderTarget.texture.name = 'SSGI';

		/**
		 * The material that is used to render the effect.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._material = new NodeMaterial();
		this._material.name = 'SSGI';

		/**
		 * The result of the effect is represented as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._ssgiRenderTarget.texture );

	}

	/**
	 * Returns the result of the effect as a texture node.
	 *
	 * @return {PassTextureNode} A texture node that represents the result of the effect.
	 */
	getTextureNode() {

		return this._textureNode;

	}

	/**
	 * Sets the size of the effect.
	 *
	 * @param {number} width - The width of the effect.
	 * @param {number} height - The height of the effect.
	 */
	setSize( width, height ) {

		this._resolution.value.set( width, height );
		this._ssgiRenderTarget.setSize( width, height );

		this._halfProjScale.value = height / ( Math.tan( this._camera.fov * MathUtils.DEG2RAD * 0.5 ) * 2 ) * 0.5;

	}

	/**
	 * This method is used to render the effect once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		//

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		// update temporal uniforms

		if ( this.useTemporalFiltering === true ) {

			const frameId = frame.frameId;

			this._temporalDirection.value = _temporalRotations[ frameId % 6 ] / 360;
			this._temporalOffset.value = _spatialOffsets[ frameId % 4 ];

		} else {

			this._temporalDirection.value = 1;
			this._temporalOffset.value = 1;

		}

		//

		_quadMesh.material = this._material;
		_quadMesh.name = 'SSGI';

		// clear

		renderer.setClearColor( 0x000000, 1 );

		// gi

		renderer.setRenderTarget( this._ssgiRenderTarget );
		_quadMesh.render( renderer );

		// restore

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		const uvNode = uv();
		const MAX_RAY = uint( 32 );
		const globalOccludedBitfield = uint( 0 );

		const sampleDepth = ( uv ) => {

			const depth = this.depthNode.sample( uv ).r;

			if ( builder.renderer.logarithmicDepthBuffer === true ) {

				const viewZ = logarithmicDepthToViewZ( depth, this._cameraNear, this._cameraFar );

				return viewZToPerspectiveDepth( viewZ, this._cameraNear, this._cameraFar );

			}

			return depth;

		};

		const sampleNormal = ( uv ) => ( this.normalNode !== null ) ? this.normalNode.sample( uv ).rgb.normalize() : getNormalFromDepth( uv, this.depthNode.value, this._cameraProjectionMatrixInverse );
		const sampleBeauty = ( uv ) => this.beautyNode.sample( uv );

		// From Activision GTAO paper: https://www.activision.com/cdn/research/s2016_pbs_activision_occlusion.pptx

		const spatialOffsets = Fn( ( [ position ] ) => {

			return float( 0.25 ).mul( sub( position.y, position.x ).bitAnd( 3 ) );

		} ).setLayout( {
			name: 'spatialOffsets',
			type: 'float',
			inputs: [
				{ name: 'position', type: 'vec2' }
			]
		} );

		const GTAOFastAcos = Fn( ( [ value ] ) => {

			const outVal = abs( value ).mul( float( - 0.156583 ) ).add( HALF_PI );
			outVal.mulAssign( sqrt( abs( value ).oneMinus() ) );

			const x = value.x.greaterThanEqual( 0 ).select( outVal.x, PI.sub( outVal.x ) );
			const y = value.y.greaterThanEqual( 0 ).select( outVal.y, PI.sub( outVal.y ) );

			return vec2( x, y );

		} ).setLayout( {
			name: 'GTAOFastAcos',
			type: 'vec2',
			inputs: [
				{ name: 'value', type: 'vec2' }
			]
		} );

		const horizonSampling = Fn( ( [ directionIsRight, RADIUS, viewPosition, slideDirTexelSize, initialRayStep, uvNode, viewDir, viewNormal, n ] ) => {

			const STEP_COUNT = this.stepCount.toConst();
			const EXP_FACTOR = this.expFactor.toConst();
			const THICKNESS = this.thickness.toConst();
			const BACKFACE_LIGHTING = this.backfaceLighting.toConst();

			const stepRadius = float( 0 );

			If( this.useScreenSpaceSampling.equal( true ), () => {

				stepRadius.assign( RADIUS.mul( this._resolution.x.div( 2 ) ).div( float( 16 ) ) ); // SSRT3 has a bug where stepRadius is divided by STEP_COUNT twice; fix here

			} ).Else( () => {

				stepRadius.assign( max( RADIUS.mul( this._halfProjScale ).div( viewPosition.z.negate() ), float( STEP_COUNT ) ) ); // Port note: viewZ is negative so a negate is required

			} );

			stepRadius.divAssign( float( STEP_COUNT ).add( 1 ) );
			const radiusVS = max( 1, float( STEP_COUNT.sub( 1 ) ) ).mul( stepRadius );
			const uvDirection = directionIsRight.equal( true ).select( vec2( 1, - 1 ), vec2( - 1, 1 ) ); // Port note: Because of different uv conventions, uv-y has a different sign
			const samplingDirection = directionIsRight.equal( true ).select( 1, - 1 );

			const color = vec3( 0 );

			const lastSampleViewPosition = vec3( viewPosition ).toVar();

			Loop( { start: uint( 0 ), end: STEP_COUNT, type: 'uint', condition: '<' }, ( { i } ) => {

				const offset = pow( abs( mul( stepRadius, float( i ).add( initialRayStep ) ).div( radiusVS ) ), EXP_FACTOR ).mul( radiusVS ).toConst();
				const uvOffset = slideDirTexelSize.mul( max( offset, float( i ).add( 1 ) ) ).toConst();
				const sampleUV = uvNode.add( uvOffset.mul( uvDirection ) ).toConst();

				If( sampleUV.x.lessThanEqual( 0 ).or( sampleUV.y.lessThanEqual( 0 ) ).or( sampleUV.x.greaterThanEqual( 1 ) ).or( sampleUV.y.greaterThanEqual( 1 ) ), () => {

					Break();

				} );

				const sampleViewPosition = getViewPosition( sampleUV, sampleDepth( sampleUV ), this._cameraProjectionMatrixInverse ).toConst();
				const pixelToSample = sampleViewPosition.sub( viewPosition ).normalize().toConst();
				const linearThicknessMultiplier = this.useLinearThickness.equal( true ).select( sampleViewPosition.z.negate().div( this._cameraFar ).clamp().mul( 100 ), float( 1 ) );
				const pixelToSampleBackface = normalize( sampleViewPosition.sub( linearThicknessMultiplier.mul( viewDir ).mul( THICKNESS ) ).sub( viewPosition ) );

				let frontBackHorizon = vec2( dot( pixelToSample, viewDir ), dot( pixelToSampleBackface, viewDir ) );
				frontBackHorizon = GTAOFastAcos( clamp( frontBackHorizon, - 1, 1 ) );
				frontBackHorizon = clamp( div( mul( samplingDirection, frontBackHorizon.negate() ).sub( n.sub( HALF_PI ) ), PI ) ); // Port note: subtract half pi instead of adding it
				frontBackHorizon = directionIsRight.equal( true ).select( frontBackHorizon.yx, frontBackHorizon.xy ); // Front/Back get inverted depending on angle

				// inline ComputeOccludedBitfield() for easier debugging

				const minHorizon = frontBackHorizon.x.toConst();
				const maxHorizon = frontBackHorizon.y.toConst();

				const startHorizonInt = uint( frontBackHorizon.mul( float( MAX_RAY ) ) ).toConst();
				const angleHorizonInt = uint( ceil( maxHorizon.sub( minHorizon ).mul( float( MAX_RAY ) ) ) ).toConst();
				const angleHorizonBitfield = angleHorizonInt.greaterThan( uint( 0 ) ).select( uint( shiftRight( uint( 0xFFFFFFFF ), uint( 32 ).sub( MAX_RAY ).add( MAX_RAY.sub( angleHorizonInt ) ) ) ), uint( 0 ) ).toConst();
				let currentOccludedBitfield = angleHorizonBitfield.shiftLeft( startHorizonInt );
				currentOccludedBitfield = currentOccludedBitfield.bitAnd( globalOccludedBitfield.bitNot() );

				globalOccludedBitfield.assign( globalOccludedBitfield.bitOr( currentOccludedBitfield ) );
				const numOccludedZones = countOneBits( currentOccludedBitfield );

				//

				If( numOccludedZones.greaterThan( 0 ), () => { // If a ray hit the sample, that sample is visible from shading point

					const lightColor = sampleBeauty( sampleUV );

					If( luminance( lightColor ).greaterThan( 0.001 ), () => { // Continue if there is light at that location (intensity > 0)

						const lightDirectionVS = normalize( pixelToSample );
						const normalDotLightDirection = clamp( dot( viewNormal, lightDirectionVS ) );

						If( normalDotLightDirection.greaterThan( 0.001 ), () => { // Continue if light is facing surface normal

							const lightNormalVS = sampleNormal( sampleUV );

							// Intensity of outgoing light in the direction of the shading point

							let lightNormalDotLightDirection = dot( lightNormalVS, lightDirectionVS.negate() );

							const d = sign( lightNormalDotLightDirection ).lessThan( 0 ).select( abs( lightNormalDotLightDirection ).mul( BACKFACE_LIGHTING ), abs( lightNormalDotLightDirection ) );
							lightNormalDotLightDirection = BACKFACE_LIGHTING.greaterThan( 0 ).and( dot( lightNormalVS, viewDir ).greaterThan( 0 ) ).select( d, clamp( lightNormalDotLightDirection ) );

							color.rgb.addAssign( float( numOccludedZones ).div( float( MAX_RAY ) ).mul( lightColor ).mul( normalDotLightDirection ).mul( lightNormalDotLightDirection ) );

						} );

					} );

				} );

				lastSampleViewPosition.assign( sampleViewPosition );

			} );

			return vec3( color );

		} );

		const gi = Fn( () => {

			const depth = sampleDepth( uvNode ).toVar();

			depth.greaterThanEqual( 1.0 ).discard();

			const viewPosition = getViewPosition( uvNode, depth, this._cameraProjectionMatrixInverse ).toVar();
			const viewNormal = sampleNormal( uvNode ).toVar();
			const viewDir = normalize( viewPosition.xyz.negate() ).toVar();

			//

			const noiseOffset = spatialOffsets( screenCoordinate );
			const noiseDirection = interleavedGradientNoise( screenCoordinate );
			const noiseJitterIdx = this._temporalDirection.mul( 0.02 ); // Port: Add noiseJitterIdx here for slightly better noise convergence with TRAA (see #31890 for more details)
			const initialRayStep = fract( noiseOffset.add( this._temporalOffset ) ).add( rand( uvNode.add( noiseJitterIdx ).mul( 2 ).sub( 1 ) ) );

			const ao = float( 0 );
			const color = vec3( 0 );

			const ROTATION_COUNT = this.sliceCount.toConst();
			const AO_INTENSITY = this.aoIntensity.toConst();
			const GI_INTENSITY = this.giIntensity.toConst();
			const RADIUS = this.radius.toConst();

			Loop( { start: uint( 0 ), end: ROTATION_COUNT, type: 'uint', condition: '<' }, ( { i } ) => {

				const rotationAngle = mul( float( i ).add( noiseDirection ).add( this._temporalDirection ), PI.div( float( ROTATION_COUNT ) ) ).toConst();
				const sliceDir = vec3( vec2( cos( rotationAngle ), sin( rotationAngle ) ), 0 ).toConst();
				const slideDirTexelSize = sliceDir.xy.mul( float( 1 ).div( this._resolution ) ).toConst();

				const planeNormal = normalize( cross( sliceDir, viewDir ) ).toConst();
				const tangent = cross( viewDir, planeNormal ).toConst();
				const projectedNormal = viewNormal.sub( planeNormal.mul( dot( viewNormal, planeNormal ) ) ).toConst();
				const projectedNormalNormalized = normalize( projectedNormal ).toConst();

				const cos_n = clamp( dot( projectedNormalNormalized, viewDir ), - 1, 1 ).toConst();
				const n = sign( dot( projectedNormal, tangent ) ).negate().mul( acos( cos_n ) ).toConst();

				globalOccludedBitfield.assign( 0 );

				color.addAssign( horizonSampling( bool( true ), RADIUS, viewPosition, slideDirTexelSize, initialRayStep, uvNode, viewDir, viewNormal, n ) );
				color.addAssign( horizonSampling( bool( false ), RADIUS, viewPosition, slideDirTexelSize, initialRayStep, uvNode, viewDir, viewNormal, n ) );

				ao.addAssign( float( countOneBits( globalOccludedBitfield ) ).div( float( MAX_RAY ) ) );

			} );

			ao.divAssign( float( ROTATION_COUNT ) );
			ao.assign( pow( ao.clamp().oneMinus(), AO_INTENSITY ).clamp() );

			color.divAssign( float( ROTATION_COUNT ) );
			color.mulAssign( GI_INTENSITY );

			// scale color based on luminance

			const maxLuminance = float( 7 ).toConst(); // 7 represent a HDR luminance value
			const currentLuminance = luminance( color );

			const scale = currentLuminance.greaterThan( maxLuminance ).select( maxLuminance.div( currentLuminance ), float( 1 ) );
			color.mulAssign( scale );

			return vec4( color, ao );

		} );

		this._material.fragmentNode = gi().context( builder.getSharedContext() );
		this._material.needsUpdate = true;

		//

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		this._ssgiRenderTarget.dispose();

		this._material.dispose();

	}

}

export default SSGINode;

/**
 * TSL function for creating a SSGI effect.
 *
 * @tsl
 * @function
 * @param {TextureNode} beautyNode - The texture node that represents the input of the effect.
 * @param {TextureNode} depthNode - A texture node that represents the scene's depth.
 * @param {TextureNode} normalNode - A texture node that represents the scene's normals.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @returns {SSGINode}
 */
export const ssgi = ( beautyNode, depthNode, normalNode, camera ) => new SSGINode( convertToTexture( beautyNode ), depthNode, normalNode, camera );
