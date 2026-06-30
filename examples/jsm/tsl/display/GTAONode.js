import { DataTexture, RenderTarget, RepeatWrapping, Vector2, Vector3, TempNode, QuadMesh, NodeMaterial, RendererUtils, RedFormat, LinearFilter } from 'three/webgpu';
import { reference, logarithmicDepthToViewZ, viewZToPerspectiveDepth, getNormalFromDepth, getViewPosition, getScreenPositionFromClip, nodeObject, Fn, float, NodeUpdateType, uv, uniform, Loop, vec2, vec3, vec4, int, dot, max, min, pow, abs, If, textureSize, sin, cos, PI, texture, passTexture, mat3, add, normalize, cross, mix, acos, clamp, interleavedGradientNoise, screenCoordinate, rand } from 'three/tsl';

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
 * scenePass.contextNode = builtinAOContext( aoPassOutput.sample( screenUV ).r );
 *
 * renderPipeline.outputNode = scenePass;
 * ```
 *
 * Reference: [Practical Real-Time Strategies for Accurate Indirect Occlusion](https://www.activision.com/cdn/research/Practical_Real_Time_Strategies_for_Accurate_Indirect_Occlusion_NEW%20VERSION_COLOR.pdf).
 *
 * @augments TempNode
 * @three_import import { ao } from 'three/addons/tsl/display/GTAONode.js';
 */
class GTAONode extends TempNode {

	static get type() {

		return 'GTAONode';

	}

	/**
	 * Constructs a new GTAO node.
	 *
	 * @param {Node<float>} depthNode - A node that represents the scene's depth.
	 * @param {?Node<vec3>} normalNode - A node that represents the scene's normals.
	 * @param {Camera} camera - The camera the scene is rendered with.
	 * @param {?Node<vec2>} velocityNode - A node that represents the scene's velocity.
	 * Required to enable the temporal accumulation pass (see {@link GTAONode#temporalAccumulation}); omit to disable it.
	 */
	constructor( depthNode, normalNode, camera, velocityNode = null ) {

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
		 * A node that represents the scene's velocity. Used by the temporal
		 * accumulation pass to reproject the previous resolved AO. Without a velocity
		 * node the reprojection assumes zero motion, so moving objects ghost.
		 *
		 * @private
		 * @type {?Node<vec2>}
		 */
		this._velocityNode = velocityNode;

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
		this._aoRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, format: RedFormat } );
		this._aoRenderTarget.texture.name = 'GTAONode.AO';

		/**
		 * History target for the temporal accumulation pass, holding the previous
		 * frame's resolved AO for velocity reprojection. Uses LinearFilter so the
		 * reprojected history fetch (fractional UV) is bilinear and the output
		 * upsamples bilinearly to full resolution instead of blocky nearest texels.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._historyRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, format: RedFormat } );
		this._historyRenderTarget.texture.name = 'GTAONode.History';
		this._historyRenderTarget.texture.minFilter = LinearFilter;
		this._historyRenderTarget.texture.magFilter = LinearFilter;

		/**
		 * Receives the resolved AO (the node's output): the accumulation pass writes it
		 * when temporal accumulation is on, otherwise the AO pass writes it directly.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._accumulationRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, format: RedFormat } );
		this._accumulationRenderTarget.texture.name = 'GTAONode.Accumulation';
		this._accumulationRenderTarget.texture.minFilter = LinearFilter;
		this._accumulationRenderTarget.texture.magFilter = LinearFilter;

		// uniforms

		/**
		 * The radius of the ambient occlusion.
		 *
		 * @type {UniformNode<float>}
		 */
		this.radius = uniform( 0.25 );

		/**
		 * The resolution of the effect. Can be scaled via
		 * `resolutionScale`.
		 *
		 * @type {UniformNode<vec2>}
		 */
		this.resolution = uniform( new Vector2() );

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
		 * @type {UniformNode<float>}
		 */
		this.samples = uniform( 16 );

		/**
		 * Whether to vary the sampling pattern per frame. When `true`, the slice
		 * rotation and ray-step phase are cycled each frame, so every frame is a fresh,
		 * decorrelated realization for {@link GTAONode#temporalAccumulation} (and/or an
		 * external `TRAANode`) to average. When `false` the pattern is static and a
		 * manual denoise via `DenoiseNode` might be required.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.jitter = false;

		/**
		 * Whether to temporally accumulate the AO: each frame is blended with the
		 * previous resolved frame reprojected through the velocity buffer, with stale
		 * history (disocclusions / edges) rejected by clamping to the current frame's
		 * local AO min/max. Pair with {@link GTAONode#jitter} so the sampling pattern
		 * varies per frame — otherwise there's nothing to average.
		 *
		 * When `false`, the AO pass writes the output directly and no accumulation
		 * pass runs. Requires a velocity node to be supplied to the constructor.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.temporalAccumulation = false;

		/**
		 * Current-frame blend weight for temporal accumulation when the reprojected
		 * history is valid (range `(0, 1]`). Lower = smoother but slower to react,
		 * higher = more responsive but noisier. `0.1` accumulates over ~10 frames.
		 *
		 * @type {UniformNode<float>}
		 */
		this.temporalAccumulationAlpha = uniform( 0.1 );

		/**
		 * The node represents the internal noise texture used by the AO.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._noiseNode = texture( generateMagicSquareNoise() );

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
		 * The material that is used to render the effect.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._material = new NodeMaterial();
		this._material.name = 'GTAO';

		/**
		 * The material that resolves the temporal accumulation pass.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._accumulationMaterial = new NodeMaterial();
		this._accumulationMaterial.name = 'GTAO.Accumulation';

		/**
		 * The result of the effect is represented as a separate texture node.
		 * Points at the resolve target: the accumulation pass writes it when temporal
		 * accumulation is on, otherwise the AO pass writes it directly. The binding is
		 * fixed either way, so the `temporalAccumulation` toggle needs no recompile.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._accumulationRenderTarget.texture );

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

		width = Math.round( this.resolutionScale * width );
		height = Math.round( this.resolutionScale * height );

		this.resolution.value.set( width, height );
		this._aoRenderTarget.setSize( width, height );
		this._historyRenderTarget.setSize( width, height );
		this._accumulationRenderTarget.setSize( width, height );

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

		if ( this.jitter === true ) {

			const frameId = frame.frameId;

			this._temporalDirection.value = _temporalRotations[ frameId % 6 ] / 360;
			this._temporalOffset.value = _spatialOffsets[ frameId % 4 ];

		} else {

			this._temporalDirection.value = 0;
			this._temporalOffset.value = 1;

		}

		//

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		// clear

		renderer.setClearColor( 0xffffff, 1 );

		// AO horizon search. With temporal accumulation on, the AO is written to its
		// own target and the accumulation pass resolves it into the output; with it
		// off, the AO is written straight to the output target and the accumulation
		// pass (and its history copy) is skipped.
		const aoTarget = this.temporalAccumulation ? this._aoRenderTarget : this._accumulationRenderTarget;

		_quadMesh.material = this._material;
		_quadMesh.name = 'AO';
		renderer.setRenderTarget( aoTarget );
		_quadMesh.render( renderer );

		// Temporal accumulation: reproject the previous resolved AO through the
		// velocity buffer and blend it with the current raw AO, writing the resolve
		// target (the node's output), then copy it into the history target for the
		// next frame.
		if ( this.temporalAccumulation ) {

			if ( this._velocityNode === null && ! this._warnedNoVelocity ) {

				console.warn( 'GTAONode: temporalAccumulation requires a velocityNode passed to the constructor.' );
				this._warnedNoVelocity = true;

			}

			_quadMesh.material = this._accumulationMaterial;
			_quadMesh.name = 'GTAO.Accumulation';
			renderer.setRenderTarget( this._accumulationRenderTarget );
			_quadMesh.render( renderer );

			renderer.copyTextureToTexture( this._accumulationRenderTarget.texture, this._historyRenderTarget.texture );

		}

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

		const sampleDepth = ( uv ) => {

			const depth = this.depthNode.sample( uv ).r;

			if ( builder.renderer.logarithmicDepthBuffer === true ) {

				const viewZ = logarithmicDepthToViewZ( depth, this._cameraNear, this._cameraFar );

				return viewZToPerspectiveDepth( viewZ, this._cameraNear, this._cameraFar );

			}

			return depth;

		};

		const sampleNoise = ( uv ) => this._noiseNode.sample( uv );
		const sampleNormal = ( uv ) => ( this.normalNode !== null ) ? this.normalNode.sample( uv ).rgb.normalize() : getNormalFromDepth( uv, this.depthNode.value, this._cameraProjectionMatrixInverse );

		const ao = Fn( () => {

			const depth = sampleDepth( uvNode ).toVar();

			depth.greaterThanEqual( 1.0 ).discard();

			const viewPosition = getViewPosition( uvNode, depth, this._cameraProjectionMatrixInverse ).toVar();
			const viewNormal = sampleNormal( uvNode ).toVar();

			const radius = this.radius;
			const viewDir = normalize( viewPosition.xyz.negate() ).toVar();
			const clipPosition = this._cameraProjectionMatrix.mul( vec4( viewPosition, 1.0 ) ).toVar();

			const noiseResolution = textureSize( this._noiseNode, 0 );
			let noiseUv = vec2( uvNode.x, uvNode.y.oneMinus() );
			noiseUv = noiseUv.mul( this.resolution.div( noiseResolution ) );

			const noiseTexel = sampleNoise( noiseUv );
			const randomVec = noiseTexel.xyz.mul( 2.0 ).sub( 1.0 );
			const tangent = vec3( randomVec.xy, 0.0 ).normalize();
			const bitangent = vec3( tangent.y.mul( - 1.0 ), tangent.x, 0.0 );
			const kernelMatrix = mat3( tangent, bitangent, vec3( 0.0, 0.0, 1.0 ) );

			const DIRECTIONS = this.samples.lessThan( 30 ).select( 3, 5 ).toVar();
			const STEPS = add( this.samples, DIRECTIONS.sub( 1 ) ).div( DIRECTIONS ).toVar();

			const ao = float( 0 ).toVar();

			// Each iteration analyzes one vertical "slice" of the 3D space around the fragment.

			// Per-step phase jitter for spatio-temporal decorrelation.
			const noiseJitterIdx = this._temporalDirection.mul( 0.02 );
			const stepJitter = interleavedGradientNoise( screenCoordinate.add( this._temporalOffset ) ).add( rand( uvNode.add( noiseJitterIdx ).mul( 2 ).sub( 1 ) ) );

			Loop( { start: int( 0 ), end: DIRECTIONS, type: 'int', condition: '<' }, ( { i } ) => {

				const angle = float( i ).div( float( DIRECTIONS ) ).mul( PI ).add( this._temporalDirection ).toVar();
				const sampleDir = kernelMatrix.mul( vec3( cos( angle ), sin( angle ), 0 ) ).toVar();
				const clipDirRadius = this._cameraProjectionMatrix.mul( vec4( sampleDir, 0.0 ) ).mul( radius ).toVar();

				const sliceBitangent = normalize( cross( sampleDir, viewDir ) ).toVar();
				const sliceTangent = cross( sliceBitangent, viewDir ).toVar();

				// Project the view normal onto the slice plane (remove component along sliceBitangent).
				// The unnormalized length is the foreshortening weight applied at slice integration.
				// (Activision GTAO paper, Section 3.2 "Per-pixel sampling".)
				const projNRaw = viewNormal.sub( sliceBitangent.mul( dot( viewNormal, sliceBitangent ) ) ).toVar();
				const projNLen = projNRaw.length().toVar();
				const projN = projNRaw.div( max( projNLen, float( 0.0001 ) ) ).toVar();

				// γ — angle of projN within the slice plane, signed by the tangent direction.
				const nSin = dot( projN, sliceTangent ).toVar();
				const nCos = clamp( dot( projN, viewDir ), 0, 1 ).toVar();
				const signNSin = nSin.greaterThanEqual( 0 ).select( float( 1 ), float( - 1 ) );
				const angleN = signNSin.mul( acos( nCos ) ).toVar();

				const tangentToNormalInSlice = cross( projN, sliceBitangent ).toVar();
				const cosHorizon = dot( viewDir, tangentToNormalInSlice ).toVar();
				const cosHorizons = vec2( cosHorizon, cosHorizon.negate() ).toVar();

				// For each slice, the inner loop performs ray marching to find the horizons.

				Loop( { end: STEPS, type: 'int', name: 'j', condition: '<' }, ( { j } ) => {

					// Quadratic step distribution ( sampleDist = t² ) concentrates samples in the
					// near-field. (Blender's Eevee adaptation)
					const t = float( j ).add( 1.0 ).add( stepJitter ).div( STEPS ).toVar();
					const sampleDist = t.mul( t );
					const clipOffset = clipDirRadius.mul( sampleDist ).toVar();

					// The loop marches in two opposite directions (x and y) along the slice's line to find the horizon on both sides.

					// x

					const sampleScreenPositionX = getScreenPositionFromClip( clipPosition.add( clipOffset ) ).toVar();
					const sampleDepthX = sampleDepth( sampleScreenPositionX ).toVar();
					const sampleSceneViewPositionX = getViewPosition( sampleScreenPositionX, sampleDepthX, this._cameraProjectionMatrixInverse ).toVar();
					const viewDeltaX = sampleSceneViewPositionX.sub( viewPosition ).toVar();
					const lenX = viewDeltaX.length().toVar();

					// Manual normalize guards against zero-length delta.
					const sHX = dot( viewDir, viewDeltaX.div( max( lenX, float( 0.0001 ) ) ) );

					// Sphere falloff: ( dist / radius )² fades the sample's horizon contribution
					// back toward the prior horizon as it approaches the radius boundary.
					// (squared variant of the paper's near-field attenuation;
					// Activision GTAO paper, Section 4.3 "Bounding the sampling area")
					const distFacX = min( lenX.div( radius ), 1 );
					const distFacSqX = distFacX.mul( distFacX );

					If( abs( viewDeltaX.z ).lessThan( this.thickness ), () => {

						cosHorizons.x.assign( mix( max( cosHorizons.x, sHX ), cosHorizons.x, distFacSqX ) );

					} );

					// y

					const sampleScreenPositionY = getScreenPositionFromClip( clipPosition.sub( clipOffset ) ).toVar();
					const sampleDepthY = sampleDepth( sampleScreenPositionY ).toVar();
					const sampleSceneViewPositionY = getViewPosition( sampleScreenPositionY, sampleDepthY, this._cameraProjectionMatrixInverse ).toVar();
					const viewDeltaY = sampleSceneViewPositionY.sub( viewPosition ).toVar();
					const lenY = viewDeltaY.length().toVar();

					const sHY = dot( viewDir, viewDeltaY.div( max( lenY, float( 0.0001 ) ) ) );

					const distFacY = min( lenY.div( radius ), 1 );
					const distFacSqY = distFacY.mul( distFacY );

					If( abs( viewDeltaY.z ).lessThan( this.thickness ), () => {

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

				const hPos = acos( cosHorizons.y ).toVar();
				const hNeg = acos( cosHorizons.x ).negate().toVar();

				const termPos = cos( hPos.mul( 2 ).sub( angleN ) ).negate().add( nCos ).add( hPos.mul( 2 ).mul( nSin ) );
				const termNeg = cos( hNeg.mul( 2 ).sub( angleN ) ).negate().add( nCos ).add( hNeg.mul( 2 ).mul( nSin ) );
				const a = termPos.add( termNeg ).mul( 0.25 );

				// |projN| is the foreshortening weight from the per-slice normal projection.
				ao.addAssign( projNLen.mul( a ) );

			} );

			ao.assign( clamp( ao.div( DIRECTIONS ), 0, 1 ) );
			ao.assign( pow( ao, this.scale ) );

			return ao;

		} );

		this._material.fragmentNode = ao().context( builder.getSharedContext() );
		this._material.needsUpdate = true;

		// Velocity-reprojected accumulation of the raw AO: each frame blends the
		// current AO with the reprojected previous frame, clamped to the local 3×3 AO
		// min/max to reject stale history at disocclusions and edges. Averaging the
		// per-frame realizations (varied by `jitter`) drives the AO noise toward zero.
		// Reprojection matches `TRAANode`: historyUV = uv - velocity.xy * ( 0.5, -0.5 ).

		const aoTextureNode = texture( this._aoRenderTarget.texture );
		const historyTextureNode = texture( this._historyRenderTarget.texture );

		const temporal = Fn( () => {

			// Sky pixels short-circuit.
			this.depthNode.sample( uvNode ).r.greaterThanEqual( 1.0 ).discard();

			const current = aoTextureNode.sample( uvNode ).r.toVar();

			// Local AO min/max over a 3×3 neighborhood — the clamp window for history.
			const texelSize = vec2( 1 ).div( this.resolution ).toVar();
			const aoMin = current.toVar();
			const aoMax = current.toVar();

			for ( let dy = - 1; dy <= 1; dy ++ ) {

				for ( let dx = - 1; dx <= 1; dx ++ ) {

					if ( dx === 0 && dy === 0 ) continue;

					const s = aoTextureNode.sample( uvNode.add( vec2( dx, dy ).mul( texelSize ) ) ).r;
					aoMin.assign( min( aoMin, s ) );
					aoMax.assign( max( aoMax, s ) );

				}

			}

			// Reproject through velocity (NDC → UV with Y flip). Without a velocity
			// node, assume zero motion (a static scene still accumulates correctly).
			const offsetUV = ( this._velocityNode !== null )
				? this._velocityNode.sample( uvNode ).xy.mul( vec2( 0.5, - 0.5 ) )
				: vec2( 0 );
			const historyUV = uvNode.sub( offsetUV ).toVar();

			// Clamp reprojected history into the current local AO range (ghost reject).
			const history = clamp( historyTextureNode.sample( historyUV ).r, aoMin, aoMax );

			// History only valid where the reprojected UV stays on screen.
			const validUV = historyUV.greaterThanEqual( 0 ).all().and( historyUV.lessThanEqual( 1 ).all() );

			// Current-frame weight: temporalAccumulationAlpha while accumulating, 1
			// (pure current) when the reprojected history is off-screen.
			const alpha = validUV.select( this.temporalAccumulationAlpha, float( 1 ) );

			return vec4( mix( history, current, alpha ), 0, 0, 1 );

		} );

		this._accumulationMaterial.fragmentNode = temporal().context( builder.getSharedContext() );
		this._accumulationMaterial.needsUpdate = true;

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		this._aoRenderTarget.dispose();
		this._historyRenderTarget.dispose();
		this._accumulationRenderTarget.dispose();

		this._material.dispose();
		this._accumulationMaterial.dispose();

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
 * @param {?Node<vec2>} velocityNode - A node that represents the scene's velocity.
 * Required to enable temporal accumulation of the AO; omit to disable it.
 * @returns {GTAONode}
 */
export const ao = ( depthNode, normalNode, camera, velocityNode = null ) => new GTAONode( nodeObject( depthNode ), nodeObject( normalNode ), camera, velocityNode !== null ? nodeObject( velocityNode ) : null );
