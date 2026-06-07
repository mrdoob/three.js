import { RenderTarget, Vector2, TempNode, QuadMesh, NodeMaterial, RendererUtils, RedFormat, LinearFilter } from 'three/webgpu';
import { reference, logarithmicDepthToViewZ, viewZToPerspectiveDepth, getNormalFromDepth, getViewPosition, nodeObject, Fn, float, NodeUpdateType, uv, uniform, Loop, vec2, vec3, vec4, int, dot, max, min, pow, abs, If, textureSize, sin, cos, PI, texture, passTexture, mat3, add, normalize, cross, mix, acos, clamp, fract, interleavedGradientNoise, screenCoordinate } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

// R2 low-discrepancy sequence constants — the 2D generalization of the golden
// ratio. Each frame the blue-noise samples are scrolled by `frameId ×` these, so
// successive frames form a maximally-spread quasirandom sequence for the temporal
// accumulator while every frame keeps its blue-noise spectrum. Using two distinct
// irrationals (rather than the same golden ratio on both channels) keeps the
// rotation/step-jitter pair jointly well distributed in 2D instead of marching
// along one diagonal. (Roberts 2018, "The Unreasonable Effectiveness of
// Quasirandom Sequences"; Wolfe 2017, "Animating Noise For Integration Over Time".)
const _r2GoldenX = 0.7548776662466927; // 1 / plastic-number
const _r2GoldenY = 0.5698402909980532; // 1 / plastic-number²

let _rendererState;

/**
 * Post processing node for applying Ground Truth Ambient Occlusion (GTAO) to a scene.
 * ```js
 * const renderPipeline = new THREE.RenderPipeline( renderer );
 *
 * const scenePass = pass( scene, camera );
 * scenePass.setMRT( mrt( {
 * 	output: output,
 * 	normal: normalView
 * } ) );
 *
 * const scenePassColor = scenePass.getTextureNode( 'output' );
 * const scenePassNormal = scenePass.getTextureNode( 'normal' );
 * const scenePassDepth = scenePass.getTextureNode( 'depth' );
 *
 * const aoPass = ao( scenePassDepth, scenePassNormal, camera );
 * const aoPassOutput = aoPass.getTextureNode();
 *
 * renderPipeline.outputNode = scenePassColor.mul( vec4( vec3( aoPassOutput.r ), 1 ) );
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
		 * accumulation pass to reproject the previous resolved AO. `null` disables
		 * temporal accumulation (the pass degrades to a passthrough).
		 *
		 * @private
		 * @type {?Node<vec2>}
		 */
		this._velocityNode = velocityNode;

		/**
		 * Render resolution as a fraction of the screen size (`1` = full, `0.5` = half).
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

		// History + resolve targets for the temporal accumulation pass. LinearFilter
		// so the reprojected history fetch (fractional UV) is bilinear, and so the
		// output upsamples bilinearly to full-res instead of blocky nearest texels.
		this._historyRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, format: RedFormat } );
		this._historyRenderTarget.texture.name = 'GTAONode.History';
		this._historyRenderTarget.texture.minFilter = LinearFilter;
		this._historyRenderTarget.texture.magFilter = LinearFilter;

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
		 * @deprecated Since the switch to quadratic ray stepping with sphere falloff,
		 * step distribution is fixed at `t²` and this uniform has no effect. Kept for
		 * backward compatibility and will be removed in a future release.
		 *
		 * @type {UniformNode<float>}
		 */
		this.distanceExponent = uniform( 1 );

		/**
		 * @deprecated Replaced by the sphere falloff `mix( max( h, sH ), h, (dist/radius)² )`,
		 * which has no tunable parameter. Kept for backward compatibility and will be
		 * removed in a future release.
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
		 * Whether to vary the sampling pattern per frame. When `true`, the blue-noise
		 * samples are scrolled along the R2 quasirandom sequence each frame, so every
		 * frame is a fresh, decorrelated realization for
		 * {@link GTAONode#temporalAccumulation} (and/or an external `TRAANode`) to
		 * average. When `false` the pattern is static.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.jitter = true;

		/**
		 * Whether to temporally accumulate the AO: each frame is blended with the
		 * previous resolved frame reprojected through the velocity buffer, with stale
		 * history (disocclusions / edges) rejected by clamping to the current frame's
		 * local AO min/max. Pair with {@link GTAONode#jitter} so the
		 * pattern varies per frame — otherwise there's nothing to average.
		 *
		 * When `false`, the AO pass writes the output directly and no accumulation
		 * pass runs. Requires a velocity node to be supplied to the constructor.
		 *
		 * @type {boolean}
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
		 * Backing field for {@link GTAONode#noiseNode}.
		 *
		 * @private
		 * @type {?TextureNode}
		 */
		this._noiseNode = null;

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
		 * Per-frame golden-ratio scroll added to the blue-noise samples (R channel →
		 * slice rotation, G channel → step jitter) while {@link GTAONode#jitter}
		 * is enabled. Advancing along the R2 quasirandom sequence each frame gives the
		 * temporal accumulation pass a fresh, maximally-decorrelated realization while
		 * preserving each frame's blue-noise spectrum. Zero when temporal filtering is
		 * off (the noise is then static). Computed on the CPU to stay precise at large
		 * frame counts.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._jitterOffset = uniform( new Vector2() );

		/**
		 * The material that is used to render the effect.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._material = new NodeMaterial();
		this._material.name = 'GTAO';

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
	 * Optional tileable noise texture driving the slice rotation (channel R) and
	 * per-step phase jitter (channel G). When `null` (default), the AO uses cheap
	 * per-pixel interleaved gradient noise — no texture fetch, no CPU generation.
	 * Assign a two-channel blue-noise texture for a higher-quality spectrum when a
	 * temporal resolve (TRAA / accumulation) is available. Switching the source at
	 * runtime triggers a shader recompile.
	 *
	 * @type {?TextureNode}
	 * @default null
	 */
	get noiseNode() {

		return this._noiseNode;

	}

	set noiseNode( value ) {

		if ( value === this._noiseNode ) return;

		this._noiseNode = value;

		// The noise source is resolved at build time inside the AO fragment, so the
		// fragment must be rebuilt (not just recompiled) to switch between the
		// texture path and interleaved gradient noise.
		if ( this._rebuildAOMaterial !== undefined ) this._rebuildAOMaterial();

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

		const lowW = Math.max( 1, Math.round( this.resolutionScale * width ) );
		const lowH = Math.max( 1, Math.round( this.resolutionScale * height ) );

		this.resolution.value.set( lowW, lowH );
		this._aoRenderTarget.setSize( lowW, lowH );
		this._historyRenderTarget.setSize( lowW, lowH );
		this._accumulationRenderTarget.setSize( lowW, lowH );

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

			// Scroll the blue noise along the R2 sequence. Computed here in double
			// precision and reduced mod 1, so it stays exact for any frameId (a
			// shader-side `frameId × irrational` would lose its fraction at high
			// frame counts).
			this._jitterOffset.value.set(
				( frameId * _r2GoldenX ) % 1,
				( frameId * _r2GoldenY ) % 1
			);

		} else {

			this._jitterOffset.value.set( 0, 0 );

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

		const normalSourceNode = this.normalNode;
		const fallbackDepthForNormal = this.depthNode.value;

		// Bilinear depth sampling blends values across silhouette edges, producing
		// phantom mid-depth values that corrupt the horizon search and cause visible
		// banding at low AO radius. textureGather returns the same 2×2 footprint
		// unblended, so we can take the min (nearest surface wins) without a separate
		// downsample pass.
		const sampleDepth = ( uv ) => {

			const g = this.depthNode.gather().sample( uv );
			const depth = min( min( g.x, g.y ), min( g.z, g.w ) );

			if ( builder.renderer.logarithmicDepthBuffer === true ) {

				const viewZ = logarithmicDepthToViewZ( depth, this._cameraNear, this._cameraFar );

				return viewZToPerspectiveDepth( viewZ, this._cameraNear, this._cameraFar );

			}

			return depth;

		};

		const sampleNormal = ( uv ) => ( normalSourceNode !== null )
			? normalSourceNode.sample( uv ).rgb.normalize()
			: getNormalFromDepth( uv, fallbackDepthForNormal, this._cameraProjectionMatrixInverse );

		const ao = Fn( () => {

			const depth = sampleDepth( uvNode ).toVar();

			depth.greaterThanEqual( 1.0 ).discard();

			const viewPosition = getViewPosition( uvNode, depth, this._cameraProjectionMatrixInverse ).toVar();
			const viewNormal = sampleNormal( uvNode ).toVar();

			const radiusToUse = this.radius;

			// Per-pixel sampling noise. `noise1` → slice rotation, `noise2` → per-step
			// phase jitter. Both are scrolled per frame by the R2 jitter offset (zero
			// when `jitter` is off) so each frame is a decorrelated realization for the
			// temporal resolve. Default: cheap interleaved gradient noise (pure ALU, no
			// fetch). When a noise texture is injected, sample its R/G channels instead.
			let noise1, noise2;

			if ( this.noiseNode !== null ) {

				const noiseUv = uvNode.mul( this.resolution.div( textureSize( this.noiseNode, 0 ) ) );
				const noiseSample = this.noiseNode.sample( noiseUv );
				noise1 = fract( noiseSample.r.add( this._jitterOffset.x ) );
				noise2 = fract( noiseSample.g.add( this._jitterOffset.y ) );

			} else {

				noise1 = fract( interleavedGradientNoise( screenCoordinate ).add( this._jitterOffset.x ) );
				noise2 = fract( interleavedGradientNoise( screenCoordinate.add( vec2( 97.0, 71.0 ) ) ).add( this._jitterOffset.y ) );

			}

			// Random tangent direction from noise1, used to rotate the per-slice azimuth.
			const tangentAngle = noise1.mul( PI ).mul( 2.0 );
			const tangent = vec3( cos( tangentAngle ), sin( tangentAngle ), 0.0 );
			const bitangent = vec3( tangent.y.mul( - 1.0 ), tangent.x, 0.0 );
			const kernelMatrix = mat3( tangent, bitangent, vec3( 0.0, 0.0, 1.0 ) );

			const DIRECTIONS = this.samples.lessThan( 30 ).select( 3, 5 ).toVar();
			const STEPS = add( this.samples, DIRECTIONS.sub( 1 ) ).div( DIRECTIONS ).toVar();

			const ao = float( 0 ).toVar();

			// Each iteration analyzes one vertical "slice" of the 3D space around the fragment.

			// Per-step phase jitter for spatio-temporal decorrelation.
			// (Activision GTAO slides 86, 92–93 "Noise Distribution".)
			const stepJitter = noise2.toVar();

			// Loop-invariant (constant per pixel): view direction and the clip-space ray
			// origin. Projecting the slice direction once per slice (clipStep, below) turns
			// each ray-march step into a clip-space multiply-add instead of a full matrix
			// transform per tap.
			const viewDir = normalize( viewPosition.xyz.negate() ).toVar();
			const clipCenter = this._cameraProjectionMatrix.mul( vec4( viewPosition.xyz, 1.0 ) ).toVar();

			Loop( { start: int( 0 ), end: DIRECTIONS, type: 'int', condition: '<' }, ( { i } ) => {

				const angle = float( i ).div( float( DIRECTIONS ) ).mul( PI ).toVar();
				const sampleDir = vec3( cos( angle ), sin( angle ), 0 ).toVar();
				sampleDir.assign( normalize( kernelMatrix.mul( sampleDir ) ) );

				// Clip-space step direction for this slice (see clipCenter above).
				const clipStep = this._cameraProjectionMatrix.mul( vec4( sampleDir, 0.0 ) ).toVar();

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
				const cosHorizons = vec2( dot( viewDir, tangentToNormalInSlice ), dot( viewDir, tangentToNormalInSlice.negate() ) ).toVar();

				// For each slice, the inner loop performs ray marching to find the horizons.

				Loop( { end: STEPS, type: 'int', name: 'j', condition: '<' }, ( { j } ) => {

					// Quadratic step distribution ( sampleDist = t² ) concentrates samples in the
					// near-field. (Blender's Eevee adaptation)
					const t = float( j ).add( 1.0 ).add( stepJitter ).div( STEPS ).toVar();
					const sampleDist = t.mul( t );
					const offsetScale = radiusToUse.mul( sampleDist ).toVar();

					// The loop marches in two opposite directions (x and y) along the slice's line to find the horizon on both sides.

					// x — clip-space ray step ( = getScreenPosition( viewPosition + sampleDir·offsetScale ) )

					const clipX = clipCenter.add( clipStep.mul( offsetScale ) ).toVar();
					const sampleUvX = clipX.xy.div( clipX.w ).mul( 0.5 ).add( 0.5 ).toVar();
					const sampleScreenPositionX = vec2( sampleUvX.x, sampleUvX.y.oneMinus() ).toVar();
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
					const distFacX = clamp( lenX.div( radiusToUse ), 0, 1 );
					const distFacSqX = distFacX.mul( distFacX );

					If( abs( viewDeltaX.z ).lessThan( this.thickness ), () => {

						cosHorizons.x.assign( mix( max( cosHorizons.x, sHX ), cosHorizons.x, distFacSqX ) );

					} );

					// y — opposite clip-space ray step (reuses clipStep)

					const clipY = clipCenter.sub( clipStep.mul( offsetScale ) ).toVar();
					const sampleUvY = clipY.xy.div( clipY.w ).mul( 0.5 ).add( 0.5 ).toVar();
					const sampleScreenPositionY = vec2( sampleUvY.x, sampleUvY.y.oneMinus() ).toVar();
					const sampleDepthY = sampleDepth( sampleScreenPositionY ).toVar();
					const sampleSceneViewPositionY = getViewPosition( sampleScreenPositionY, sampleDepthY, this._cameraProjectionMatrixInverse ).toVar();
					const viewDeltaY = sampleSceneViewPositionY.sub( viewPosition ).toVar();
					const lenY = viewDeltaY.length().toVar();

					const sHY = dot( viewDir, viewDeltaY.div( max( lenY, float( 0.0001 ) ) ) );

					const distFacY = clamp( lenY.div( radiusToUse ), 0, 1 );
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

		// The IGN ↔ noise-texture choice is resolved at build time inside `ao()`, so
		// switching `noiseNode` at runtime has to rebuild this fragment, not just
		// recompile the existing one.
		this._rebuildAOMaterial = () => {

			this._material.fragmentNode = ao().context( builder.getSharedContext() );
			this._material.needsUpdate = true;

		};

		this._rebuildAOMaterial();

		// ─── Temporal accumulation ─────────────────────────────────────────────
		//
		// Velocity-reprojected accumulation of the raw AO. Each frame blends the
		// current AO with the previous resolved frame sampled at the reprojected UV;
		// the reprojected history is clamped to the current frame's local 3×3 AO
		// min/max so stale values at disocclusions / edges are rejected rather than
		// ghosting. Averaging the per-frame realizations (fresh each frame when
		// `jitter` scrolls the blue noise) drives the blue-noise
		// variance toward zero. Reprojection convention matches `TRAANode`:
		// offsetUV = velocity.xy * ( 0.5, -0.5 ), historyUV = uv - offsetUV.

		const aoTextureNode = texture( this._aoRenderTarget.texture );
		const historyTextureNode = texture( this._historyRenderTarget.texture );

		const temporal = Fn( () => {

			// Sky pixels short-circuit. Single sample is sufficient here — the
			// gather + min used by sampleDepth() is only needed in the horizon
			// search where silhouette blending would corrupt the result.
			this.depthNode.sample( uvNode ).greaterThanEqual( 1.0 ).discard();

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
			// node, assume zero motion (the pass is forced to passthrough anyway).
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
