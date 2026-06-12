import { RenderTarget, Vector2, TempNode, QuadMesh, NodeMaterial, RendererUtils, HalfFloatType, NearestFilter, DepthTexture, FloatType } from 'three/webgpu';
import { Fn, If, float, vec2, vec4, uv, uniform, texture, passTexture, convertToTexture, luminance, dot, min, max, abs, pow, mix, outputStruct, property, sqrt, ivec2, perspectiveDepthToViewZ, getNormalFromDepth, NodeUpdateType } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

// à-trous kernel ( 1/4, 1/2, 1/4 ) used as a 3×3 separable filter. The small per-level tap footprint
// keeps each level cheap, while the increasing per-level step still covers a wide area across levels.
const _kernel = [ 1 / 4, 1 / 2, 1 / 4 ];

// deadzone of the temporal gradient, in units of the local standard deviation: sampling jitter
// moves the neighborhood mean by about one deviation per frame ( the jitter is spatially
// coherent ) while a real lighting change moves it by many
const _gradientDeadzone = 3;

// fixed accumulation weight of the luminance moments, decoupled from the adaptive alpha: if the
// moments followed it, a fully rejected history would collapse the variance to zero, which in
// turn pins the gradient and the alpha at their maximum with no way to recover
const _momentsAlpha = 0.2;

/**
 * Post processing node that denoises a noisy screen-space signal (such as the raw output of
 * {@link SSGINode}) using a spatiotemporal filter in the spirit of SVGF (Spatiotemporal
 * Variance-Guided Filtering).
 *
 * The pipeline is:
 * - **Temporal accumulation**: the current frame is reprojected against history using the
 *   velocity buffer and blended, with a depth-based disocclusion test that resets history where
 *   the reprojection is invalid. Luminance moments are accumulated alongside the signal, giving
 *   a per-pixel variance estimate of the incoming noise.
 * - **Adaptive temporal alpha**: a temporal gradient measured in units of the local standard
 *   deviation raises the accumulation weight towards the current frame where the signal changed,
 *   rejecting stale history to limit ghosting. Expressing the gradient in deviation units
 *   separates sampling jitter (about one deviation by construction) from real lighting change
 *   (many deviations).
 * - **Variance-guided à-trous**: a multi-level edge-avoiding wavelet filter (increasing step size
 *   per level) spatially denoises the accumulated signal. The luminance edge-stop scales with the
 *   local deviation, so noisy regions are smoothed aggressively while converged regions keep
 *   their edges; the variance estimate is filtered along with the signal.
 * - **Feedback**: the first à-trous level is fed back as the color history for the next frame,
 *   which keeps the temporal signal denoised without over-blurring (the SVGF feedback trick).
 *
 * References:
 * - {@link https://cg.ivd.kit.edu/publications/2017/svgf/svgf_preprint.pdf} (SVGF, Schied et al.)
 * - {@link https://cg.ivd.kit.edu/english/atf.php} (A-SVGF adaptive temporal filtering, Schied et al.)
 * - {@link https://jo.dreggn.org/home/2010_atrous.pdf} (Edge-Avoiding À-Trous, Dammertz et al.)
 *
 * @augments TempNode
 * @three_import import { svgf } from 'three/addons/tsl/display/SVGFNode.js';
 */
class SVGFNode extends TempNode {

	static get type() {

		return 'SVGFNode';

	}

	/**
	 * Constructs a new SVGF node.
	 *
	 * @param {TextureNode} beautyNode - The noisy texture node to denoise (e.g. the SSGI output).
	 * @param {TextureNode} depthNode - A texture node that represents the scene's depth.
	 * @param {?TextureNode} normalNode - A texture node that represents the scene's view-space normals.
	 * @param {TextureNode} velocityNode - A texture node that represents the scene's velocity.
	 * @param {PerspectiveCamera} camera - The camera the scene is rendered with.
	 */
	constructor( beautyNode, depthNode, normalNode, velocityNode, camera ) {

		super( 'vec4' );

		/**
		 * The noisy texture node to denoise.
		 *
		 * @type {TextureNode}
		 */
		this.beautyNode = beautyNode;

		/**
		 * A texture node that represents the scene's depth.
		 *
		 * @type {TextureNode}
		 */
		this.depthNode = depthNode;

		/**
		 * A texture node that represents the scene's view-space normals. If `null`, normals are
		 * reconstructed from depth in the shader.
		 *
		 * @type {?TextureNode}
		 */
		this.normalNode = normalNode;

		/**
		 * A texture node that represents the scene's velocity.
		 *
		 * @type {TextureNode}
		 */
		this.velocityNode = velocityNode;

		/**
		 * The camera the scene is rendered with.
		 *
		 * @type {PerspectiveCamera}
		 */
		this.camera = camera;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders its
		 * passes once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * Number of edge-avoiding à-trous levels. Each level doubles the sampling step.
		 *
		 * @type {number}
		 * @default 5
		 */
		this.atrousIterations = 5;

		/**
		 * Minimum weight given to the current frame during temporal accumulation. Smaller values
		 * accumulate more history (less noise, more lag). Should be in the range `[0.01, 1]`.
		 *
		 * @type {UniformNode<float>}
		 * @default 0.1
		 */
		this.temporalAlpha = uniform( 0.1 );

		/**
		 * Strength of the adaptive temporal alpha (anti-ghosting). The temporal gradient — how much
		 * the signal changed versus the reprojected history, in units of the local standard
		 * deviation — is scaled by this value to raise the accumulation weight towards the current
		 * frame, rejecting stale history where the lighting changed. `0` disables it (fixed
		 * `temporalAlpha`); higher reduces ghosting at the cost of more noise on changing regions.
		 *
		 * @type {UniformNode<float>}
		 * @default 4
		 */
		this.antiGhosting = uniform( 4 );

		/**
		 * Relative depth difference above which history is rejected as a disocclusion.
		 *
		 * @type {UniformNode<float>}
		 * @default 0.05
		 */
		this.depthRejection = uniform( 0.05 );

		/**
		 * Depth edge-stopping strength of the à-trous filter (plane distance, in world units).
		 *
		 * @type {UniformNode<float>}
		 * @default 4
		 */
		this.depthPhi = uniform( 4 );

		/**
		 * Normal edge-stopping strength of the à-trous filter.
		 *
		 * @type {UniformNode<float>}
		 * @default 128
		 */
		this.normalPhi = uniform( 128 );

		/**
		 * Luminance edge-stopping strength of the à-trous filter, in units of the local standard
		 * deviation. Differences below `lumaPhi` deviations are smoothed; larger differences are
		 * treated as edges and preserved.
		 *
		 * @type {UniformNode<float>}
		 * @default 4
		 */
		this.lumaPhi = uniform( 4 );

		/**
		 * Clamps the luminance of each incoming sample to this multiple of its local
		 * neighborhood mean before accumulation. Suppresses isolated bright outliers
		 * ( fireflies ) that would otherwise blink in dark regions. Lower values suppress
		 * more aggressively at the cost of dimming small bright details.
		 *
		 * @type {UniformNode<float>}
		 * @default 2
		 */
		this.fireflyFactor = uniform( 2 );

		// private uniforms

		/**
		 * The inverse resolution of the effect.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._invSize = uniform( new Vector2() );

		/**
		 * The current à-trous step size, updated per level in `updateBefore()`.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._stepSize = uniform( 1 );

		/**
		 * The camera's inverse projection matrix.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraProjectionMatrixInverse = uniform( camera.projectionMatrixInverse );

		/**
		 * The camera's near and far values.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._cameraNearFar = uniform( new Vector2() );

		// render targets. The signal targets carry two attachments: the filtered signal, and
		// the luminance moments with the variance derived from them

		const rtOptions = { depthBuffer: false, type: HalfFloatType, count: 2 };

		/**
		 * Holds the previous frame's filtered result and luminance moments (the history fed back
		 * each frame). Its depth texture stores the previous frame's depth for the disocclusion test.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._historyRenderTarget = new RenderTarget( 1, 1, { ...rtOptions, depthTexture: new DepthTexture() } );

		/**
		 * Holds the temporally accumulated signal and moments before spatial filtering.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._temporalRenderTarget = new RenderTarget( 1, 1, rtOptions );

		/**
		 * Ping-pong targets for the à-trous iterations.
		 *
		 * @private
		 * @type {Array<RenderTarget>}
		 */
		this._atrousRenderTargets = [ new RenderTarget( 1, 1, rtOptions ), new RenderTarget( 1, 1, rtOptions ) ];

		/**
		 * Holds the final filtered result.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._resolveRenderTarget = new RenderTarget( 1, 1, rtOptions );

		/**
		 * Holds a packed geometry buffer ( view-space normal in rgb, linear view-space Z in a )
		 * computed once per frame so the à-trous filter does not reconstruct it per tap.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._geometryRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._geometryRenderTarget.texture.name = 'SVGF.geometry';

		this._historyRenderTarget.textures[ 0 ].name = 'SVGF.history';
		this._historyRenderTarget.textures[ 1 ].name = 'SVGF.history.moments';
		this._temporalRenderTarget.textures[ 0 ].name = 'SVGF.temporal';
		this._temporalRenderTarget.textures[ 1 ].name = 'SVGF.temporal.moments';
		this._atrousRenderTargets[ 0 ].textures[ 0 ].name = 'SVGF.atrous0';
		this._atrousRenderTargets[ 0 ].textures[ 1 ].name = 'SVGF.atrous0.moments';
		this._atrousRenderTargets[ 1 ].textures[ 0 ].name = 'SVGF.atrous1';
		this._atrousRenderTargets[ 1 ].textures[ 1 ].name = 'SVGF.atrous1.moments';
		this._resolveRenderTarget.textures[ 0 ].name = 'SVGF.resolve';
		this._resolveRenderTarget.textures[ 1 ].name = 'SVGF.resolve.moments';

		// the resolve output keeps linear filtering so the result upsamples smoothly when the
		// effect runs at a lower resolution than the output

		for ( const rt of [ this._historyRenderTarget, this._temporalRenderTarget, this._geometryRenderTarget, ...this._atrousRenderTargets ] ) {

			for ( const tex of rt.textures ) {

				tex.minFilter = NearestFilter;
				tex.magFilter = NearestFilter;

			}

		}

		// materials

		/**
		 * @private
		 * @type {NodeMaterial}
		 */
		this._temporalMaterial = new NodeMaterial();
		this._temporalMaterial.name = 'SVGF.temporal';

		/**
		 * @private
		 * @type {NodeMaterial}
		 */
		this._atrousMaterial = new NodeMaterial();
		this._atrousMaterial.name = 'SVGF.atrous';

		/**
		 * @private
		 * @type {NodeMaterial}
		 */
		this._geometryMaterial = new NodeMaterial();
		this._geometryMaterial.name = 'SVGF.geometry';

		/**
		 * Texture node for the previous frame's depth, used by the disocclusion test.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._previousDepthNode = texture( new DepthTexture( 1, 1 ) );

		/**
		 * Texture node holding the history (feedback) color.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._historyNode = texture( this._historyRenderTarget.textures[ 0 ] );

		/**
		 * Texture node holding the history luminance moments.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._historyMomentsNode = texture( this._historyRenderTarget.textures[ 1 ] );

		/**
		 * Texture node holding the current à-trous color input (swapped per iteration).
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._atrousInputNode = texture( this._temporalRenderTarget.textures[ 0 ] );

		/**
		 * Texture node holding the current à-trous variance input (swapped per iteration).
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._atrousVarianceNode = texture( this._temporalRenderTarget.textures[ 1 ] );

		/**
		 * Texture node holding the packed geometry buffer ( view normal + linear view Z ).
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._geometryNode = texture( this._geometryRenderTarget.texture );

		/**
		 * The result of the effect as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._resolveRenderTarget.textures[ 0 ] );

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

		this._invSize.value.set( 1 / width, 1 / height );

		this._historyRenderTarget.setSize( width, height );
		this._temporalRenderTarget.setSize( width, height );
		this._resolveRenderTarget.setSize( width, height );
		this._atrousRenderTargets[ 0 ].setSize( width, height );
		this._atrousRenderTargets[ 1 ].setSize( width, height );
		this._geometryRenderTarget.setSize( width, height );

	}

	/**
	 * This method is used to render the effect once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		this._cameraProjectionMatrixInverse.value.copy( this.camera.projectionMatrixInverse );
		this._cameraNearFar.value.set( this.camera.near, this.camera.far );

		// keep the effect in sync with the dimensions of the beauty texture

		const beautyTexture = this.beautyNode.value;
		const width = beautyTexture.image.width;
		const height = beautyTexture.image.height;

		const needsRestart = this._historyRenderTarget.width !== width || this._historyRenderTarget.height !== height;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		this.setSize( width, height );

		if ( needsRestart === true ) {

			// after a resize, seed the history with the current beauty buffer so the effect does
			// not fade in from black

			renderer.initRenderTarget( this._historyRenderTarget );
			renderer.copyTextureToTexture( beautyTexture, this._historyRenderTarget.textures[ 0 ] );

		}

		// geometry prepare ( packed view normal + linear view Z ) -> geometry target

		renderer.setRenderTarget( this._geometryRenderTarget );
		_quadMesh.material = this._geometryMaterial;
		_quadMesh.name = 'SVGF.geometry';
		_quadMesh.render( renderer );

		// temporal accumulation -> temporal target

		renderer.setRenderTarget( this._temporalRenderTarget );
		_quadMesh.material = this._temporalMaterial;
		_quadMesh.name = 'SVGF.temporal';
		_quadMesh.render( renderer );

		// the integrated moments become next frame's moments history

		renderer.copyTextureToTexture( this._temporalRenderTarget.textures[ 1 ], this._historyRenderTarget.textures[ 1 ] );

		// edge-avoiding à-trous, ping-pong between targets, last level into the resolve target

		const iterations = this.atrousIterations;
		let inputTarget = this._temporalRenderTarget;

		_quadMesh.material = this._atrousMaterial;
		_quadMesh.name = 'SVGF.atrous';

		for ( let i = 0; i < iterations; i ++ ) {

			const target = ( i === iterations - 1 ) ? this._resolveRenderTarget : this._atrousRenderTargets[ i % 2 ];

			this._stepSize.value = 1 << i; // 1, 2, 4, 8, 16, ...
			this._atrousInputNode.value = inputTarget.textures[ 0 ];
			this._atrousVarianceNode.value = inputTarget.textures[ 1 ];

			renderer.setRenderTarget( target );
			_quadMesh.render( renderer );

			// feed the first à-trous level back as next frame's color history

			if ( i === 0 ) {

				renderer.copyTextureToTexture( target.textures[ 0 ], this._historyRenderTarget.textures[ 0 ] );

			}

			inputTarget = target;

		}

		// store the current depth as the previous depth for next frame's disocclusion test

		const size = renderer.getDrawingBufferSize( _size );

		if ( this._historyRenderTarget.width === size.width && this._historyRenderTarget.height === size.height ) {

			renderer.copyTextureToTexture( this.depthNode.value, this._historyRenderTarget.depthTexture );
			this._previousDepthNode.value = this._historyRenderTarget.depthTexture;

		}

		renderer.setRenderTarget( null );

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		if ( builder.renderer.reversedDepthBuffer === true ) {

			this._historyRenderTarget.depthTexture.type = FloatType;

		}

		const sampleDepth = ( uvNode ) => this.depthNode.sample( uvNode ).r;
		const sampleNormal = ( uvNode ) => ( this.normalNode !== null ) ? this.normalNode.sample( uvNode ).rgb.normalize() : getNormalFromDepth( uvNode, this.depthNode.value, this._cameraProjectionMatrixInverse );

		const sharedContext = builder.getSharedContext();

		// --- temporal accumulation pass ---
		// outputs the accumulated signal and the integrated luminance moments
		// ( μ1, μ2 ) with the variance derived from them

		const temporalColor = property( 'vec4' );
		const temporalMoments = property( 'vec4' );

		const temporal = Fn( () => {

			const uvNode = uv();
			const texel = ivec2( uvNode.mul( this.velocityNode.size() ) ); // texel coordinates of the velocity texture, whose resolution can differ from the input

			const current = this.beautyNode.sample( uvNode ).toVar();
			const depth = sampleDepth( uvNode ).toVar();

			temporalColor.assign( current );
			temporalMoments.assign( vec4( 0.0 ) );

			If( depth.lessThan( 1.0 ), () => {

				// reproject through the velocity buffer ( NDC -> uv )

				const offsetUV = this.velocityNode.load( texel ).xy.mul( vec2( 0.5, - 0.5 ) );
				const historyUV = uvNode.sub( offsetUV ).toVar();

				const inBounds = historyUV.greaterThanEqual( 0.0 ).all().and( historyUV.lessThanEqual( 1.0 ).all() );

				// depth-based disocclusion test ( compare linear view-space Z )

				const { x: near, y: far } = this._cameraNearFar;
				const currentZ = perspectiveDepthToViewZ( depth, near, far );
				const previousZ = perspectiveDepthToViewZ( this._previousDepthNode.sample( historyUV ).r, near, far );
				const validDepth = abs( currentZ.sub( previousZ ) ).lessThan( abs( currentZ ).mul( this.depthRejection ) );

				const validHistory = inBounds.and( validDepth );

				const history = this._historyNode.sample( historyUV ).toVar();
				const historyMoments = this._historyMomentsNode.sample( historyUV ).rg.toVar();

				// 3×3 spatial luminance moments of the incoming frame: used by the firefly clamp, as
				// the change estimate for the temporal gradient and as variance fallback on disocclusion

				const currentLuma = luminance( current.rgb ).toVar();

				const blurredLuma = float( currentLuma ).toVar();
				const blurredLuma2 = currentLuma.mul( currentLuma ).toVar();

				for ( let y = - 1; y <= 1; y ++ ) {

					for ( let x = - 1; x <= 1; x ++ ) {

						if ( x === 0 && y === 0 ) continue; // the center tap is already in currentLuma

						const tapLuma = luminance( this.beautyNode.sample( uvNode.add( vec2( x, y ).mul( this._invSize ) ) ).rgb );

						blurredLuma.addAssign( tapLuma );
						blurredLuma2.addAssign( tapLuma.mul( tapLuma ) );

					}

				}

				blurredLuma.mulAssign( 1 / 9 );
				blurredLuma2.mulAssign( 1 / 9 );

				// suppress fireflies: clamp the sample against its neighborhood mean so isolated
				// bright outliers cannot blink in and out of the accumulated result

				const maxLuma = blurredLuma.mul( this.fireflyFactor );

				current.rgb.mulAssign( currentLuma.greaterThan( maxLuma ).select( maxLuma.div( currentLuma ), float( 1.0 ) ) );

				// temporal gradient in units of the local standard deviation

				const historyVariance = max( historyMoments.y.sub( historyMoments.x.mul( historyMoments.x ) ), 0.0 );
				const deviation = sqrt( historyVariance.add( 1e-4 ) );
				const historyLuma = luminance( history.rgb );
				const gradient = abs( blurredLuma.sub( historyLuma ) ).div( deviation );

				const adaptiveAlpha = max( this.temporalAlpha, gradient.sub( _gradientDeadzone ).mul( this.antiGhosting ).clamp() );

				const alpha = validHistory.select( adaptiveAlpha, float( 1.0 ) );

				temporalColor.assign( mix( history, current, alpha ) );

				// the luminance moments are accumulated with the same reprojection; on disocclusion
				// the spatial moments take over as an immediate estimate

				const clampedLuma = min( currentLuma, maxLuma ); // the firefly clamp limits the luminance to maxLuma
				const currentMoments = vec2( clampedLuma, clampedLuma.mul( clampedLuma ) );
				const integratedMoments = validHistory.select( mix( historyMoments, currentMoments, _momentsAlpha ), vec2( blurredLuma, blurredLuma2 ) ).toVar();
				const variance = max( integratedMoments.y.sub( integratedMoments.x.mul( integratedMoments.x ) ), 0.0 );

				temporalMoments.assign( vec4( integratedMoments, variance, 0.0 ) );

			} );

			return vec4( 0 ); // temporary solution until TSL does not complain anymore

		} );

		this._temporalMaterial.colorNode = temporal().context( sharedContext );
		this._temporalMaterial.outputNode = outputStruct( temporalColor, temporalMoments );
		this._temporalMaterial.needsUpdate = true;

		// --- geometry prepare pass ( view normal + linear view Z, packed once per frame ) ---

		const prepare = Fn( () => {

			const uvNode = uv();
			const depth = sampleDepth( uvNode );
			const normal = sampleNormal( uvNode );
			const viewZ = perspectiveDepthToViewZ( depth, this._cameraNearFar.x, this._cameraNearFar.y );

			// valid view Z is negative; store a positive sentinel for background so the filter skips it

			return vec4( normal, depth.greaterThanEqual( 1.0 ).select( float( 1.0 ), viewZ ) );

		} );

		this._geometryMaterial.fragmentNode = prepare().context( sharedContext );
		this._geometryMaterial.needsUpdate = true;

		// --- variance-guided à-trous pass ---

		const atrousColor = property( 'vec4' );
		const atrousMoments = property( 'vec4' );

		const atrous = Fn( () => {

			const uvNode = uv();

			const centerColor = this._atrousInputNode.sample( uvNode ).toVar();
			const centerVariance = this._atrousVarianceNode.sample( uvNode ).b.toVar();
			const centerGeometry = this._geometryNode.sample( uvNode ).toVar();
			const centerZ = centerGeometry.w.toVar();

			atrousColor.assign( centerColor );
			atrousMoments.assign( vec4( 0.0, 0.0, centerVariance, 0.0 ) );

			If( centerZ.lessThan( 0.0 ), () => { // valid geometry only

				const centerNormal = centerGeometry.xyz.toVar();
				const centerLuma = luminance( centerColor.rgb ).toVar();

				const step = this._invSize.mul( this._stepSize );

				// gather the neighborhood once; the taps drive both the variance prefilter and the filter itself

				const taps = [];

				for ( let y = - 1; y <= 1; y ++ ) {

					for ( let x = - 1; x <= 1; x ++ ) {

						if ( x === 0 && y === 0 ) continue;

						const sampleUV = uvNode.add( vec2( x, y ).mul( step ) ).toVar();

						taps.push( {
							kernelWeight: _kernel[ x + 1 ] * _kernel[ y + 1 ],
							color: this._atrousInputNode.sample( sampleUV ).toVar(),
							geometry: this._geometryNode.sample( sampleUV ).toVar(),
							variance: this._atrousVarianceNode.sample( sampleUV ).b.toVar()
						} );

					}

				}

				// the variance estimate is itself noisy: a kernel-prefiltered variance stabilizes the
				// luminance edge-stop

				const prefilteredVariance = centerVariance.mul( _kernel[ 1 ] * _kernel[ 1 ] ).toVar();

				for ( const tap of taps ) {

					prefilteredVariance.addAssign( tap.variance.mul( tap.kernelWeight ) );

				}

				// luminance differences are weighted in units of the local deviation: noisy regions
				// get smoothed aggressively while converged regions keep their edges

				const lumaScale = sqrt( prefilteredVariance ).mul( this.lumaPhi ).add( 1e-3 ).toVar();

				const sum = centerColor.toVar(); // center tap has weight 1
				const totalWeight = float( 1.0 ).toVar();
				const varianceSum = centerVariance.toVar();

				for ( const tap of taps ) {

					// edge-stopping weights ( normal, linear depth, luminance )

					const normalWeight = pow( max( dot( centerNormal, tap.geometry.xyz ), 0.0 ), this.normalPhi );
					const depthWeight = max( float( 1.0 ).sub( abs( centerZ.sub( tap.geometry.w ) ).div( this.depthPhi ) ), 0.0 );
					const lumaWeight = max( float( 1.0 ).sub( abs( luminance( tap.color.rgb ).sub( centerLuma ) ).div( lumaScale ) ), 0.0 );

					const weight = float( tap.kernelWeight ).mul( normalWeight ).mul( depthWeight ).mul( lumaWeight ).toVar();

					sum.addAssign( tap.color.mul( weight ) );
					totalWeight.addAssign( weight );
					varianceSum.addAssign( tap.variance.mul( weight.mul( weight ) ) );

				}

				atrousColor.assign( sum.div( totalWeight ) );
				atrousMoments.assign( vec4( 0.0, 0.0, varianceSum.div( totalWeight.mul( totalWeight ) ), 0.0 ) );

			} );

			return vec4( 0 ); // temporary solution until TSL does not complain anymore

		} );

		this._atrousMaterial.colorNode = atrous().context( sharedContext );
		this._atrousMaterial.outputNode = outputStruct( atrousColor, atrousMoments );
		this._atrousMaterial.needsUpdate = true;

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called when the effect is no longer required.
	 */
	dispose() {

		this._historyRenderTarget.dispose();
		this._temporalRenderTarget.dispose();
		this._resolveRenderTarget.dispose();
		this._atrousRenderTargets[ 0 ].dispose();
		this._atrousRenderTargets[ 1 ].dispose();
		this._geometryRenderTarget.dispose();

		this._temporalMaterial.dispose();
		this._atrousMaterial.dispose();
		this._geometryMaterial.dispose();

	}

}

export default SVGFNode;

/**
 * TSL function for creating an SVGF denoise effect.
 *
 * @tsl
 * @function
 * @param {Node} beautyNode - The noisy node to denoise (e.g. the SSGI output).
 * @param {Node<float>} depthNode - A node that represents the scene's depth.
 * @param {?Node<vec3>} normalNode - A node that represents the scene's view-space normals.
 * @param {Node} velocityNode - A node that represents the scene's velocity.
 * @param {PerspectiveCamera} camera - The camera the scene is rendered with.
 * @returns {SVGFNode}
 */
export const svgf = ( beautyNode, depthNode, normalNode, velocityNode, camera ) => {

	// effects that render into an internal target expose it via getTextureNode(), which
	// avoids re-rendering the input into an intermediate texture

	if ( beautyNode.isTextureNode !== true && typeof beautyNode.getTextureNode === 'function' ) {

		beautyNode = beautyNode.getTextureNode();

	}

	return new SVGFNode( convertToTexture( beautyNode ), depthNode, normalNode, velocityNode, camera );

};
