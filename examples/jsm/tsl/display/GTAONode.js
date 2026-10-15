import { DataTexture, RenderTarget, RepeatWrapping, Vector2, Vector3, Node, QuadMesh, NodeMaterial, RendererUtils, RGBAFormat } from 'three/webgpu';
import { reference, logarithmicDepthToViewZ, viewZToPerspectiveDepth, getNormalFromDepth, getViewPosition, getScreenPositionFromClip, nodeObject, Fn, float, NodeUpdateType, uv, uniform, Loop, vec2, vec3, vec4, int, dot, max, min, pow, abs, If, textureSize, sin, cos, PI, texture, passTexture, mat3, normalize, cross, mix, acos, clamp, interleavedGradientNoise, screenCoordinate, rand, context, isBackgroundDepth, screenUV, reflect, sqrt, exp2 } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

// From Activision GTAO paper: https://www.activision.com/cdn/research/s2016_pbs_activision_occlusion.pptx
const _temporalRotations = [ 60, 300, 180, 240, 120, 0 ];
const _spatialOffsets = [ 0, 0.5, 0.25, 0.75 ];

let _rendererState;

/**
 * Post processing node for applying Ground Truth Ambient Occlusion (GTAO) to a scene.
 * ```js
 * const renderPipeline = new THREE.RenderPipeline( renderer );
 *
 * // pre-pass for normals and depth
 *
 * const prePass = pass( scene, camera );
 * prePass.setMRT( mrt( {
 * 	output: normalView
 * } ) );
 *
 * const prePassNormal = prePass.getTextureNode();
 * const prePassDepth = prePass.getTextureNode( 'depth' );
 *
 * // scene pass
 *
 * const scenePass = pass( scene, camera );
 *
 * // ao
 *
 * const aoPass = ao( prePassDepth, prePassNormal, camera );
 * const aoPassOutput = aoPass.getTextureNode();
 *
 * // apply the ambient occlusion to the scene
 *
 * scenePass.contextNode = aoPass.getLightingContext();
 *
 * renderPipeline.outputNode = scenePass;
 * ```
 *
 * The output texture contains ambient visibility in R and a view-space bent normal,
 * encoded from [-1, 1] to [0, 1], in GBA. Use getBentNormalNode() to decode it.
 * getLightingContext() applies visibility to indirect diffuse lighting and
 * cone-based directional occlusion to indirect specular lighting, including clearcoat.
 * Sheen retains scalar occlusion. Without this context, materials retain their
 * existing scalar specular occlusion. Screen-space occlusion cannot account for
 * off-screen or hidden geometry. Use TRAA to resolve temporal sampling noise.
 *
 * Reference: [Practical Real-Time Strategies for Accurate Indirect Occlusion](https://www.activision.com/cdn/research/Practical_Real_Time_Strategies_for_Accurate_Indirect_Occlusion_NEW%20VERSION_COLOR.pdf).
 *
 * @augments Node
 * @three_import import { ao } from 'three/addons/tsl/display/GTAONode.js';
 */
class GTAONode extends Node {

	static get type() {

		return 'GTAONode';

	}

	/**
	 * Constructs a new GTAO node.
	 *
	 * @param {Node<float>} depthNode - A node that represents the scene's depth.
	 * @param {?Node<vec3>} normalNode - A node that represents the scene's normals.
	 * @param {Camera} camera - The camera the scene is rendered with.
	 */
	constructor( depthNode, normalNode, camera ) {

		super( 'float' );

		/**
		 * A node that represents the scene's depth.
		 *
		 * @type {Node<float>}
		 */
		this.depthNode = depthNode;

		/**
		 * A node that represents the scene's normals. If no normals are passed to the
		 * constructor (because MRT is not available), normals can be automatically
		 * reconstructed from depth values in the shader.
		 *
		 * @type {?Node<vec3>}
		 */
		this.normalNode = normalNode;

		/**
		 * The resolution scale. By default the effect is rendered in full resolution
		 * for best quality but a value of `0.5` should be sufficient for most scenes.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.resolutionScale = 1;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * The render target the ambient occlusion is rendered into.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._aoRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, format: RGBAFormat } );
		this._aoRenderTarget.texture.name = 'GTAONode.AO';

		// uniforms

		/**
		 * The radius of the ambient occlusion.
		 *
		 * @type {UniformNode<float>}
		 */
		this.radius = uniform( 0.25 );

		/**
		 * The thickness of the ambient occlusion.
		 *
		 * @type {UniformNode<float>}
		 */
		this.thickness = uniform( 1 );

		/**
		 * @deprecated since r186. The new distance model "Quadratic Ray Stepping"
		 * does not need it anymore.
		 *
		 * @type {UniformNode<float>}
		 */
		this.distanceExponent = uniform( 1 );

		/**
		 * @deprecated since r186. The new distance model "Quadratic Ray Stepping"
		 * does not need it anymore.
		 *
		 * @type {UniformNode<float>}
		 */
		this.distanceFallOff = uniform( 1 );

		/**
		 * The scale of the ambient occlusion.
		 *
		 * @type {UniformNode<float>}
		 */
		this.scale = uniform( 1 );

		/**
		 * How many samples are used to compute the AO.
		 * A higher value results in better quality but also
		 * in a more expensive runtime behavior.
		 *
		 * Note: Changing this member triggers a shader recompilation.
		 *
		 * @type {UniformNode<float>}
		 */
		this.samples = uniform( 16 );

		/**
		 * Whether to use temporal filtering or not. Setting this property to
		 * `true` requires the usage of `TRAANode`. This will help to reduce noise
		 * although it introduces typical TAA artifacts like ghosting and temporal
		 * instabilities.
		 *
		 * If setting this property to `false`, a manual denoise via `DenoiseNode`
		 * might be required.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.useTemporalFiltering = false;

		/**
		 * The resolution of the effect. Can be scaled via `resolutionScale`.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._resolution = uniform( new Vector2() );

		/**
		 * The internal noise texture used by the AO.
		 *
		 * @private
		 * @type {DataTexture}
		 */
		this._noiseTexture = generateMagicSquareNoise();

		/**
		 * The node represents the internal noise texture used by the AO.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._noiseNode = texture( this._noiseTexture );

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
		 * Resolution scale uniform.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._resolutionScale = uniform( 0 );

		/**
		 * The TSL function that computes the AO. Required for rebuild.
		 *
		 * @private
		 * @type {?Function}
		 * @default null
		 */
		this._ao = null;

		/**
		 * The sample count currently baked into the shader.
		 *
		 * @private
		 * @type {number}
		 */
		this._currentSamples = - 1;

		/**
		 * The shared builder context.  Required for rebuild.
		 *
		 * @private
		 * @type {?Object}
		 * @default null
		 */
		this._sharedContext = null;

		/**
		 * The material that is used to render the effect.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._material = new NodeMaterial();
		this._material.name = 'GTAO';

		/**
		 * The result of the effect is represented as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._aoRenderTarget.texture );

	}

	/**
	 * Returns the packed result: ambient visibility in R and encoded bent normal in GBA.
	 *
	 * @return {PassTextureNode} A texture node that represents the result of the effect.
	 */
	getTextureNode() {

		return this._textureNode;

	}

	/**
	 * Returns the view-space bent normal, pointing toward the unoccluded hemisphere.
	 * The output texture stores AO in R and the encoded bent normal in GBA.
	 *
	 * @param {Node<vec2>} [uvNode=screenUV] - Sampling coordinates.
	 * @return {Node<vec3>} The normalized bent normal.
	 */
	getBentNormalNode( uvNode = screenUV ) {

		return this._textureNode.sample( uvNode ).gba.mul( 2 ).sub( 1 ).normalize();

	}

	/**
	 * Applies GTAO to indirect lighting, using bent normals for specular occlusion.
	 * Transparent materials retain their own occlusion. Direct lighting is unaffected.
	 *
	 * @param {Node<vec2>} [uvNode=screenUV] - Sampling coordinates.
	 * @return {ContextNode} A context for a scene pass or material.
	 */
	getLightingContext( uvNode = screenUV ) {

		const visibility = this._textureNode.sample( uvNode ).r;
		const bentNormal = this.getBentNormalNode( uvNode );

		return context( {
			getAO: ( inputNode, { material } ) => {

				if ( material.transparent === true ) return inputNode;
				return inputNode !== null ? inputNode.mul( visibility ) : visibility;

			},
			getSpecularOcclusion: ( inputNode, normal, roughness, viewDirection, { material }, ambientVisibility ) => {

				if ( material.transparent === true ) return inputNode;
				return specularOcclusion( ambientVisibility, bentNormal, reflect( viewDirection.negate(), normal ), roughness );

			}
		} );

	}

	/**
	 * Sets the size of the effect.
	 *
	 * @param {number} width - The width of the effect.
	 * @param {number} height - The height of the effect.
	 */
	setSize( width, height ) {

		width = Math.round( this.resolutionScale * width );
		height = Math.round( this.resolutionScale * height );

		this._resolutionScale.value = this.resolutionScale;
		this._resolution.value.set( width, height );
		this._aoRenderTarget.setSize( width, height );

	}

	/**
	 * This method is used to render the effect once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		// update temporal uniforms

		if ( this.useTemporalFiltering === true ) {

			const frameId = frame.frameId;

			this._temporalDirection.value = _temporalRotations[ frameId % 6 ] / 360;
			this._temporalOffset.value = _spatialOffsets[ frameId % 4 ];

		} else {

			this._temporalDirection.value = 0;
			this._temporalOffset.value = 1;

		}

		// rebuild the material if the sample count has changed

		if ( this.samples.value !== this._currentSamples ) {

			this._currentSamples = this.samples.value;

			this._material.contextNode = context( this._sharedContext );
			this._material.fragmentNode = this._ao();
			this._material.needsUpdate = true;

		}

		//

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		_quadMesh.material = this._material;
		_quadMesh.name = 'AO';

		// clear

		renderer.setClearColor( 0xffffff, 1 );

		// ao

		renderer.setRenderTarget( this._aoRenderTarget );
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

		const linearizeDepth = ( depth ) => {

			if ( builder.renderer.logarithmicDepthBuffer === true ) {

				const viewZ = logarithmicDepthToViewZ( depth, this._cameraNear, this._cameraFar );

				return viewZToPerspectiveDepth( viewZ, this._cameraNear, this._cameraFar );

			}

			return depth;

		};

		const sampleDepth = ( uv ) => linearizeDepth( this.depthNode.sample( uv ).r );

		const sampleCenterDepth = ( uv ) => {

			// Sidestep the nearest-rounding during depth access for the unjittered center pixel to avoid banding

			const g = this.depthNode.gather().sample( uv );
			const depth = builder.renderer.reversedDepthBuffer === true ? max( max( g.x, g.y ), max( g.z, g.w ) ) : min( min( g.x, g.y ), min( g.z, g.w ) );

			return linearizeDepth( depth );

		};

		const sampleNoise = ( uv ) => this._noiseNode.sample( uv );
		const sampleNormal = ( uv ) => ( this.normalNode !== null ) ? this.normalNode.sample( uv ).rgb.normalize() : getNormalFromDepth( uv, this.depthNode.value, this._cameraProjectionMatrixInverse );

		const isValidSample = Fn( ( [ uv, centerTexel, size ] ) => {

			const texel = uv.mul( size ).floor().toConst();

			// rejects off-screen samples and samples that fall into the center texel

			return uv.x.greaterThan( 0 ).and( uv.x.lessThan( 1 ) ).and( uv.y.greaterThan( 0 ) ).and( uv.y.lessThan( 1 ) )
				.and( texel.x.notEqual( centerTexel.x ).or( texel.y.notEqual( centerTexel.y ) ) );

		}, { uv: 'vec2', centerTexel: 'vec2', size: 'vec2', return: 'bool' } );

		this._ao = Fn( () => {

			const depth = this._resolutionScale.lessThan( 1 ).select( sampleCenterDepth( uvNode ), sampleDepth( uvNode ) ).toConst();

			isBackgroundDepth( depth ).discard();

			const depthSize = vec2( textureSize( this.depthNode, 0 ) ).toConst();
			const centerTexel = uvNode.mul( depthSize ).floor().toConst();

			const viewPosition = getViewPosition( uvNode, depth, this._cameraProjectionMatrixInverse ).toConst();
			const viewNormal = sampleNormal( uvNode ).toConst();

			const radius = this.radius;
			const invRadius = radius.reciprocal().toConst();
			const viewDir = normalize( viewPosition.xyz.negate() ).toConst();
			const clipPosition = this._cameraProjectionMatrix.mul( vec4( viewPosition, 1.0 ) ).toConst();

			const noiseResolution = textureSize( this._noiseNode, 0 );
			let noiseUv = vec2( uvNode.x, uvNode.y.oneMinus() );
			noiseUv = noiseUv.mul( this._resolution.div( noiseResolution ) );

			const noiseTexel = sampleNoise( noiseUv );
			const randomVec = noiseTexel.xyz.mul( 2.0 ).sub( 1.0 );
			const tangent = vec3( randomVec.xy, 0.0 ).normalize();
			const bitangent = vec3( tangent.y.mul( - 1.0 ), tangent.x, 0.0 );
			const kernelMatrix = mat3( tangent, bitangent, vec3( 0.0, 0.0, 1.0 ) );

			// The sample count is baked into the shader so loop unrolling works

			const SAMPLES = this.samples.value;
			const DIRECTIONS = SAMPLES < 30 ? 3 : 5;
			const STEPS = Math.ceil( SAMPLES / DIRECTIONS );
			const invSteps = 1 / STEPS;

			const ao = float( 0 ).toVar();
			const bentNormal = viewNormal.toVar();

			// Each iteration analyzes one vertical "slice" of the 3D space around the fragment.

			// Per-step phase jitter for spatio-temporal decorrelation.
			const noiseJitterIdx = this._temporalDirection.mul( 0.02 );
			const stepJitter = interleavedGradientNoise( screenCoordinate.add( this._temporalOffset ) ).add( rand( uvNode.add( noiseJitterIdx ).mul( 2 ).sub( 1 ) ) );

			Loop( { start: int( 0 ), end: int( DIRECTIONS ), type: 'int', condition: '<' }, ( { i } ) => {

				const angle = float( i ).div( DIRECTIONS ).mul( PI ).add( this._temporalDirection ).toConst();
				const sampleDir = kernelMatrix.mul( vec3( cos( angle ), sin( angle ), 0 ) ).toConst();
				const clipDirRadius = this._cameraProjectionMatrix.mul( vec4( sampleDir, 0.0 ) ).mul( radius ).toConst();

				const sliceBitangent = normalize( cross( sampleDir, viewDir ) ).toConst();
				const sliceTangent = cross( sliceBitangent, viewDir ).toConst();

				// Project the view normal onto the slice plane (remove component along sliceBitangent).
				// The unnormalized length is the foreshortening weight applied at slice integration.
				// (Activision GTAO paper, Section 3.2 "Per-pixel sampling".)
				const projNRaw = viewNormal.sub( sliceBitangent.mul( dot( viewNormal, sliceBitangent ) ) ).toConst();
				const projNLen = projNRaw.length().toConst();
				const projN = projNRaw.div( max( projNLen, float( 0.0001 ) ) ).toConst();

				// γ — angle of projN within the slice plane, signed by the tangent direction.
				const nSin = dot( projN, sliceTangent ).toConst();
				const nCos = clamp( dot( projN, viewDir ), 0, 1 ).toConst();
				const signNSin = nSin.greaterThanEqual( 0 ).select( float( 1 ), float( - 1 ) );
				const angleN = signNSin.mul( acos( nCos ) ).toConst();

				const tangentToNormalInSlice = cross( projN, sliceBitangent ).toConst();
				const cosHorizon = dot( viewDir, tangentToNormalInSlice ).toConst();
				const cosHorizons = vec2( cosHorizon, cosHorizon.negate() ).toVar();

				// For each slice, the inner loop performs ray marching to find the horizons.

				Loop( { end: int( STEPS ), type: 'int', name: 'j', condition: '<' }, ( { j } ) => {

					// Quadratic step distribution ( sampleDist = t² ) concentrates samples in the
					// near-field. (Blender's Eevee adaptation)
					const t = float( j ).add( 1.0 ).add( stepJitter ).mul( invSteps ).toConst();
					const sampleDist = t.mul( t );
					const clipOffset = clipDirRadius.mul( sampleDist ).toConst();

					// The loop marches in two opposite directions (x and y) along the slice's line to find the horizon on both sides.

					// x

					const sampleScreenPositionX = getScreenPositionFromClip( clipPosition.add( clipOffset ) ).toConst();
					const sampleDepthX = sampleDepth( sampleScreenPositionX ).toConst();
					const sampleSceneViewPositionX = getViewPosition( sampleScreenPositionX, sampleDepthX, this._cameraProjectionMatrixInverse ).toConst();
					const viewDeltaX = sampleSceneViewPositionX.sub( viewPosition ).toConst();
					const lenX = viewDeltaX.length().toConst();

					// Manual normalize guards against zero-length delta.
					const sHX = dot( viewDir, viewDeltaX ).div( max( lenX, float( 0.0001 ) ) );

					// Sphere falloff: ( dist / radius )² fades the sample's horizon contribution
					// back toward the prior horizon as it approaches the radius boundary.
					// (squared variant of the paper's near-field attenuation;
					// Activision GTAO paper, Section 4.3 "Bounding the sampling area")
					const distFacX = min( lenX.mul( invRadius ), 1 );
					const distFacSqX = distFacX.mul( distFacX );

					If( isValidSample( sampleScreenPositionX, centerTexel, depthSize ).and( abs( viewDeltaX.z ).lessThan( this.thickness ) ), () => {

						cosHorizons.x.assign( mix( max( cosHorizons.x, sHX ), cosHorizons.x, distFacSqX ) );

					} );

					// y

					const sampleScreenPositionY = getScreenPositionFromClip( clipPosition.sub( clipOffset ) ).toConst();
					const sampleDepthY = sampleDepth( sampleScreenPositionY ).toConst();
					const sampleSceneViewPositionY = getViewPosition( sampleScreenPositionY, sampleDepthY, this._cameraProjectionMatrixInverse ).toConst();
					const viewDeltaY = sampleSceneViewPositionY.sub( viewPosition ).toConst();
					const lenY = viewDeltaY.length().toConst();

					const sHY = dot( viewDir, viewDeltaY ).div( max( lenY, float( 0.0001 ) ) );

					const distFacY = min( lenY.mul( invRadius ), 1 );
					const distFacSqY = distFacY.mul( distFacY );

					If( isValidSample( sampleScreenPositionY, centerTexel, depthSize ).and( abs( viewDeltaY.z ).lessThan( this.thickness ) ), () => {

						cosHorizons.y.assign( mix( max( cosHorizons.y, sHY ), cosHorizons.y, distFacSqY ) );

					} );

				} );

				// Cosine-weighted inner integral, closed-form (Activision GTAO paper, Eq. 7).
				// Per horizon h_i:    term_i = −cos( 2 h_i − γ ) + cos( γ ) + 2 h_i sin( γ )
				// The 0.25 factor is ½ (integral normalization) × ½ (averaging the two horizons).
				//
				// In this slice setup `sliceTangent = cross( sliceBitangent, viewDir )` works out
				// opposite to `sampleDir`, so the +sampleDir samples (cosHorizons.x) live on the
				// −T side of the slice and −sampleDir samples (cosHorizons.y) on the +T side.
				// γ is signed by +T (sliceTangent), so hPos must read from cosHorizons.y.

				const hPos = acos( cosHorizons.y ).toConst();
				const hNeg = acos( cosHorizons.x ).negate().toConst();

				const termPos = cos( hPos.mul( 2 ).sub( angleN ) ).negate().add( nCos ).add( hPos.mul( 2 ).mul( nSin ) );
				const termNeg = cos( hNeg.mul( 2 ).sub( angleN ) ).negate().add( nCos ).add( hNeg.mul( 2 ).mul( nSin ) );
				const a = termPos.add( termNeg ).mul( 0.25 );

				// |projN| is the foreshortening weight from the per-slice normal projection.
				ao.addAssign( projNLen.mul( a ) );

				// Cosine-weighted first moment of the visible slice. Subtract the
				// open slice to remove quadrature bias at low direction counts.
				const moment = ( h ) => {

					const c = cos( h );
					const s = sin( h );
					const c3 = c.mul( c ).mul( c );
					const s3 = s.mul( s ).mul( s );
					return viewDir.mul( nCos.mul( c3 ).negate().add( nSin.mul( s3 ) ).div( 3 ) )
						.add( sliceTangent.mul( nCos.mul( s3 ).div( 3 ).add( nSin.mul( c.negate().add( c3.div( 3 ) ) ) ) ) );

				};

				const openPos = angleN.add( PI.div( 2 ) );
				const openNeg = angleN.sub( PI.div( 2 ) );
				bentNormal.addAssign( moment( hPos ).add( moment( hNeg ) ).sub( moment( openPos ) ).sub( moment( openNeg ) ).mul( projNLen.mul( 1.5 / DIRECTIONS ) ) );

			} );

			ao.assign( clamp( ao.div( DIRECTIONS ), 0, 1 ) );
			ao.assign( pow( ao, this.scale ) );

			// Keep the moment in the surface hemisphere, including fully occluded pixels.
			bentNormal.addAssign( viewNormal.mul( dot( bentNormal, viewNormal ).negate().max( 0 ).add( 0.0001 ) ) );
			return vec4( ao, normalize( bentNormal ).mul( 0.5 ).add( 0.5 ) );

		} );

		this._sharedContext = builder.getSharedContext();
		this._currentSamples = this.samples.value;

		this._material.contextNode = context( builder.getSharedContext() );
		this._material.fragmentNode = this._ao();
		this._material.needsUpdate = true;

		//

		return this._textureNode.r;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		super.dispose();

		this._aoRenderTarget.dispose();

		this._noiseTexture.dispose();

		this._material.dispose();

	}

}

export default GTAONode;

/**
 * Generates the AO's noise texture for the given size.
 *
 * @param {number} [size=5] - The noise size.
 * @return {DataTexture} The generated noise texture.
 */
function generateMagicSquareNoise( size = 5 ) {

	const noiseSize = Math.floor( size ) % 2 === 0 ? Math.floor( size ) + 1 : Math.floor( size );
	const magicSquare = generateMagicSquare( noiseSize );
	const noiseSquareSize = magicSquare.length;
	const data = new Uint8Array( noiseSquareSize * 4 );

	for ( let inx = 0; inx < noiseSquareSize; ++ inx ) {

		const iAng = magicSquare[ inx ];
		const angle = ( 2 * Math.PI * iAng ) / noiseSquareSize;
		const randomVec = new Vector3(
			Math.cos( angle ),
			Math.sin( angle ),
			0
		).normalize();
		data[ inx * 4 ] = ( randomVec.x * 0.5 + 0.5 ) * 255;
		data[ inx * 4 + 1 ] = ( randomVec.y * 0.5 + 0.5 ) * 255;
		data[ inx * 4 + 2 ] = 127;
		data[ inx * 4 + 3 ] = 255;

	}

	const noiseTexture = new DataTexture( data, noiseSize, noiseSize );
	noiseTexture.wrapS = RepeatWrapping;
	noiseTexture.wrapT = RepeatWrapping;
	noiseTexture.needsUpdate = true;

	return noiseTexture;

}

/**
 * Computes an array of magic square values required to generate the noise texture.
 *
 * @param {number} size - The noise size.
 * @return {Array<number>} The magic square values.
 */
function generateMagicSquare( size ) {

	const noiseSize = Math.floor( size ) % 2 === 0 ? Math.floor( size ) + 1 : Math.floor( size );
	const noiseSquareSize = noiseSize * noiseSize;
	const magicSquare = Array( noiseSquareSize ).fill( 0 );
	let i = Math.floor( noiseSize / 2 );
	let j = noiseSize - 1;

	for ( let num = 1; num <= noiseSquareSize; ) {

		if ( i === - 1 && j === noiseSize ) {

			j = noiseSize - 2;
			i = 0;

		} else {

			if ( j === noiseSize ) {

				j = 0;

			}

			if ( i < 0 ) {

				i = noiseSize - 1;

			}

		}

		if ( magicSquare[ i * noiseSize + j ] !== 0 ) {

			j -= 2;
			i ++;
			continue;

		} else {

			magicSquare[ i * noiseSize + j ] = num ++;

		}

		j ++;
		i --;

	}

	return magicSquare;

}

/**
 * TSL function for creating a Ground Truth Ambient Occlusion (GTAO) effect.
 *
 * @tsl
 * @function
 * @param {Node<float>} depthNode - A node that represents the scene's depth.
 * @param {?Node<vec3>} normalNode - A node that represents the scene's normals.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @returns {GTAONode}
 */
export const ao = ( depthNode, normalNode, camera ) => new GTAONode( nodeObject( depthNode ), nodeObject( normalNode ), camera );

/**
 * Cone-cone specular visibility from GTAO (Jimenez et al., Appendix B).
 * All directions must be normalized and in the same coordinate space.
 * This approximates the specular lobe by a spherical cap, rather than using
 * the paper's precomputed GGX lookup table.
 *
 * @tsl
 * @function
 * @param {Node<float>} visibility - Cosine-weighted ambient visibility in [0, 1].
 * @param {Node<vec3>} bentNormal - Direction of the visibility cone.
 * @param {Node<vec3>} reflectionDirection - Specular reflection direction.
 * @param {Node<float>} roughness - Material roughness in [0, 1].
 * @return {Node<float>} Specular visibility in [0, 1].
 */
export const specularOcclusion = /*@__PURE__*/ Fn( ( [ visibility, bentNormal, reflectionDirection, roughness ] ) => {

	const cosV = sqrt( visibility.clamp().oneMinus() ).toConst();
	const cosS = exp2( roughness.clamp().pow2().mul( - 3.321928 ) ).toConst();
	const v = acos( cosV ).toConst();
	const s = acos( cosS ).toConst();
	const d = acos( dot( bentNormal, reflectionDirection ).clamp( - 1, 1 ) ).toConst();
	const result = float( 0 ).toVar();

	If( visibility.greaterThanEqual( 0.9999 ), () => {

		result.assign( 1 );

	} ).ElseIf( visibility.lessThanEqual( 0 ), () => {

		result.assign( 0 );

	} ).ElseIf( d.add( s ).lessThanEqual( v ), () => {

		result.assign( 1 );

	} ).ElseIf( d.add( v ).lessThanEqual( s ), () => {

		result.assign( cosV.oneMinus().div( cosS.oneMinus().max( 1e-6 ) ) );

	} ).ElseIf( d.lessThan( v.add( s ) ), () => {

		const sinV = sin( v );
		const sinS = sin( s );
		const sinD = sin( d );
		const cosD = cos( d );
		const a = acos( cosS.sub( cosV.mul( cosD ) ).div( sinV.mul( sinD ).max( 1e-6 ) ).clamp( - 1, 1 ) );
		const b = acos( cosV.sub( cosS.mul( cosD ) ).div( sinS.mul( sinD ).max( 1e-6 ) ).clamp( - 1, 1 ) );
		const c = acos( cosD.sub( cosV.mul( cosS ) ).div( sinV.mul( sinS ).max( 1e-6 ) ).clamp( - 1, 1 ) );
		result.assign( PI.sub( a.mul( cosV ) ).sub( b.mul( cosS ) ).sub( c ).div( PI.mul( cosS.oneMinus() ).max( 1e-6 ) ) );

	} );

	return result.clamp();

} );
