import { RenderTarget, Vector2, TempNode, QuadMesh, NodeMaterial, RendererUtils, HalfFloatType, NearestFilter, DepthTexture, FloatType } from 'three/webgpu';
import { Fn, float, vec2, vec4, uv, uniform, texture, passTexture, convertToTexture, luminance, dot, max, abs, pow, mix, If, ivec2, getViewPosition, getNormalFromDepth, NodeUpdateType } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

// à-trous kernel ( 1/4, 1/2, 1/4 ) used as a 3×3 separable filter. The small per-level tap footprint
// keeps each level cheap, while the increasing per-level step still covers a wide area across levels.
const _kernel = [ 1 / 4, 1 / 2, 1 / 4 ];

/**
 * Post processing node that denoises a noisy screen-space signal (such as the raw output of
 * {@link SSGINode}) using a spatiotemporal filter in the spirit of SVGF (Spatiotemporal
 * Variance-Guided Filtering).
 *
 * The pipeline is:
 * - **Temporal accumulation**: the current frame is reprojected against history using the
 *   velocity buffer and blended, with a depth-based disocclusion test that resets history where
 *   the reprojection is invalid. This is an alternative to denoising via {@link TRAANode}.
 * - **Adaptive temporal alpha** (A-SVGF-style): a temporal gradient raises the accumulation weight
 *   towards the current frame where the signal changed, rejecting stale history to limit ghosting
 *   under motion. The gradient is derived here from the current-vs-history difference rather than
 *   from re-shaded forward-projected samples as in the original A-SVGF.
 * - **Edge-avoiding à-trous**: a multi-level wavelet filter (increasing step size per level)
 *   spatially denoises the accumulated signal while preserving edges via depth, normal and
 *   luminance edge-stopping functions.
 * - **Feedback**: the first à-trous level is fed back as the color history for the next frame,
 *   which keeps the temporal signal denoised without over-blurring (the SVGF feedback trick).
 *
 * It does not include SVGF's variance-guided luminance weighting (per-pixel variance from temporal
 * moments driving the à-trous luminance edge-stop); the luminance weight uses a fixed `lumaPhi`.
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
		 * Strength of the adaptive temporal alpha (A-SVGF-style anti-ghosting). The temporal gradient
		 * (how much the signal changed vs reprojected history) is scaled by this value to raise the
		 * accumulation weight towards the current frame where change is detected, rejecting stale
		 * history under motion. `0` disables it (fixed `temporalAlpha`); higher reduces ghosting at
		 * the cost of more noise on moving regions.
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
		 * Luminance edge-stopping strength of the à-trous filter.
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

		// render targets

		const rtOptions = { depthBuffer: false, type: HalfFloatType };

		/**
		 * Holds the previous frame's filtered result (the color history fed back each frame). Its
		 * depth texture stores the previous frame's depth for the disocclusion test.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._historyRenderTarget = new RenderTarget( 1, 1, { ...rtOptions, depthTexture: new DepthTexture() } );
		this._historyRenderTarget.texture.name = 'SVGF.history';

		/**
		 * Holds the temporally accumulated signal before spatial filtering.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._temporalRenderTarget = new RenderTarget( 1, 1, rtOptions );
		this._temporalRenderTarget.texture.name = 'SVGF.temporal';

		/**
		 * Ping-pong targets for the à-trous iterations.
		 *
		 * @private
		 * @type {Array<RenderTarget>}
		 */
		this._atrousRenderTargets = [ new RenderTarget( 1, 1, rtOptions ), new RenderTarget( 1, 1, rtOptions ) ];
		this._atrousRenderTargets[ 0 ].texture.name = 'SVGF.atrous0';
		this._atrousRenderTargets[ 1 ].texture.name = 'SVGF.atrous1';

		/**
		 * Holds the final filtered result.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._resolveRenderTarget = new RenderTarget( 1, 1, rtOptions );
		this._resolveRenderTarget.texture.name = 'SVGF.resolve';

		/**
		 * Holds a packed geometry buffer ( view-space normal in rgb, linear view-space Z in a )
		 * computed once per frame so the à-trous filter does not reconstruct it per tap.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._geometryRenderTarget = new RenderTarget( 1, 1, rtOptions );
		this._geometryRenderTarget.texture.name = 'SVGF.geometry';

		for ( const rt of [ this._historyRenderTarget, this._temporalRenderTarget, this._resolveRenderTarget, this._geometryRenderTarget, ...this._atrousRenderTargets ] ) {

			rt.texture.minFilter = NearestFilter;
			rt.texture.magFilter = NearestFilter;

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
		this._historyNode = texture( this._historyRenderTarget.texture );

		/**
		 * Texture node holding the current à-trous input (swapped per iteration).
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._atrousInputNode = texture( this._temporalRenderTarget.texture );

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
		this._textureNode = passTexture( this, this._resolveRenderTarget.texture );

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

		// keep the effect in sync with the dimensions of the beauty node

		const beautyRenderTarget = ( this.beautyNode.isRTTNode ) ? this.beautyNode.renderTarget : this.beautyNode.passNode.renderTarget;
		const width = beautyRenderTarget.texture.width;
		const height = beautyRenderTarget.texture.height;

		const needsRestart = this._historyRenderTarget.width !== width || this._historyRenderTarget.height !== height;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		this.setSize( width, height );

		if ( needsRestart === true ) {

			// after a resize, seed the history with the current beauty buffer so the effect does
			// not fade in from black

			renderer.initRenderTarget( this._historyRenderTarget );
			renderer.copyTextureToTexture( beautyRenderTarget.texture, this._historyRenderTarget.texture );

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

		// edge-avoiding à-trous, ping-pong between targets, last level into the resolve target

		const iterations = this.atrousIterations;
		let inputTexture = this._temporalRenderTarget.texture;

		_quadMesh.material = this._atrousMaterial;
		_quadMesh.name = 'SVGF.atrous';

		for ( let i = 0; i < iterations; i ++ ) {

			const target = ( i === iterations - 1 ) ? this._resolveRenderTarget : this._atrousRenderTargets[ i % 2 ];

			this._stepSize.value = 1 << i; // 1, 2, 4, 8, 16, ...
			this._atrousInputNode.value = inputTexture;

			renderer.setRenderTarget( target );
			_quadMesh.render( renderer );

			// feed the first à-trous level back as next frame's color history

			if ( i === 0 ) {

				renderer.copyTextureToTexture( target.texture, this._historyRenderTarget.texture );

			}

			inputTexture = target.texture;

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

		// --- temporal accumulation pass ---

		const temporal = Fn( () => {

			const uvNode = uv();
			const size = this.beautyNode.size();
			const texel = ivec2( uvNode.mul( size ) );

			const current = this.beautyNode.sample( uvNode ).toVar();
			const depth = sampleDepth( uvNode ).toVar();

			const result = vec4( current ).toVar();

			If( depth.lessThan( 1.0 ), () => {

				// reproject through the velocity buffer ( NDC -> uv )

				const offsetUV = this.velocityNode.load( texel ).xy.mul( vec2( 0.5, - 0.5 ) );
				const historyUV = uvNode.sub( offsetUV ).toVar();

				const inBounds = historyUV.greaterThanEqual( 0.0 ).all().and( historyUV.lessThanEqual( 1.0 ).all() );

				// depth-based disocclusion test ( compare linear view-space Z )

				const currentZ = getViewPosition( uvNode, depth, this._cameraProjectionMatrixInverse ).z;
				const previousZ = getViewPosition( historyUV, this._previousDepthNode.sample( historyUV ).r, this._cameraProjectionMatrixInverse ).z;
				const validDepth = abs( currentZ.sub( previousZ ) ).lessThan( abs( currentZ ).mul( this.depthRejection ) );

				const validHistory = inBounds.and( validDepth );

				const history = this._historyNode.sample( historyUV );

				// A-SVGF-style adaptive temporal alpha. The temporal gradient measures how much the
				// signal changed versus the reprojected ( denoised ) history. Because the input is
				// noisy, the current luminance is averaged over a 3×3 neighborhood and a small noise
				// floor is subtracted, so only real change ( motion, disocclusion, lighting ) raises
				// alpha towards 1 and rejects stale history. A true A-SVGF gradient would instead
				// re-shade forward-projected samples with the same random sequence.

				const blurredLuma = float( 0 ).toVar();

				for ( let y = - 1; y <= 1; y ++ ) {

					for ( let x = - 1; x <= 1; x ++ ) {

						blurredLuma.addAssign( luminance( this.beautyNode.sample( uvNode.add( vec2( x, y ).mul( this._invSize ) ) ).rgb ) );

					}

				}

				blurredLuma.mulAssign( 1 / 9 );

				// suppress fireflies: clamp the sample against its neighborhood mean so isolated
				// bright outliers cannot blink in and out of the accumulated result

				const currentLuma = luminance( current.rgb ).toVar();
				const maxLuma = blurredLuma.mul( this.fireflyFactor );

				current.rgb.mulAssign( currentLuma.greaterThan( maxLuma ).select( maxLuma.div( currentLuma ), float( 1.0 ) ) );

				const historyLuma = luminance( history.rgb );

				// the luminance floor in the denominator keeps the relative gradient from amplifying
				// sub-noise changes in dark regions, where it would otherwise keep rejecting history
				// and let the raw noise blink through

				const gradient = abs( blurredLuma.sub( historyLuma ) ).div( max( blurredLuma, historyLuma ).add( 0.25 ) );
				const adaptiveAlpha = max( this.temporalAlpha, gradient.sub( 0.1 ).mul( this.antiGhosting ).clamp() );

				const alpha = validHistory.select( adaptiveAlpha, float( 1.0 ) );

				result.assign( mix( history, current, alpha ) );

			} );

			return result;

		} );

		// --- geometry prepare pass ( view normal + linear view Z, packed once per frame ) ---

		const prepare = Fn( () => {

			const uvNode = uv();
			const depth = this.depthNode.sample( uvNode ).r;
			const normal = sampleNormal( uvNode );
			const viewZ = getViewPosition( uvNode, depth, this._cameraProjectionMatrixInverse ).z;

			// valid view Z is negative; store a positive sentinel for background so the filter skips it

			return vec4( normal, depth.greaterThanEqual( 1.0 ).select( float( 1.0 ), viewZ ) );

		} );

		// --- edge-avoiding à-trous pass ---

		const atrous = Fn( () => {

			const uvNode = uv();

			const centerColor = this._atrousInputNode.sample( uvNode ).toVar();
			const centerGeometry = this._geometryNode.sample( uvNode ).toVar();
			const centerZ = centerGeometry.w.toVar();

			const result = vec4( centerColor ).toVar();

			If( centerZ.lessThan( 0.0 ), () => { // valid geometry only

				const centerNormal = centerGeometry.xyz.toVar();
				const centerLuma = luminance( centerColor.rgb ).toVar();

				const sum = vec4( centerColor ).toVar(); // center tap has weight 1
				const totalWeight = float( 1.0 ).toVar();

				const step = this._invSize.mul( this._stepSize );

				for ( let y = - 1; y <= 1; y ++ ) {

					for ( let x = - 1; x <= 1; x ++ ) {

						if ( x === 0 && y === 0 ) continue;

						const kernelWeight = _kernel[ x + 1 ] * _kernel[ y + 1 ];

						const sampleUV = uvNode.add( vec2( x, y ).mul( step ) ).toVar();

						const sampleColor = this._atrousInputNode.sample( sampleUV );
						const sampleGeometry = this._geometryNode.sample( sampleUV );

						// edge-stopping weights ( normal, linear depth, luminance )

						const normalWeight = pow( max( dot( centerNormal, sampleGeometry.xyz ), 0.0 ), this.normalPhi );
						const depthWeight = max( float( 1.0 ).sub( abs( centerZ.sub( sampleGeometry.w ) ).div( this.depthPhi ) ), 0.0 );
						const lumaWeight = max( float( 1.0 ).sub( abs( luminance( sampleColor.rgb ).sub( centerLuma ) ).div( this.lumaPhi ) ), 0.0 );

						const weight = float( kernelWeight ).mul( normalWeight ).mul( depthWeight ).mul( lumaWeight );

						sum.addAssign( sampleColor.mul( weight ) );
						totalWeight.addAssign( weight );

					}

				}

				result.assign( sum.div( totalWeight ) );

			} );

			return result;

		} );

		this._geometryMaterial.fragmentNode = prepare().context( builder.getSharedContext() );
		this._geometryMaterial.needsUpdate = true;

		this._temporalMaterial.fragmentNode = temporal().context( builder.getSharedContext() );
		this._temporalMaterial.needsUpdate = true;

		this._atrousMaterial.fragmentNode = atrous().context( builder.getSharedContext() );
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
export const svgf = ( beautyNode, depthNode, normalNode, velocityNode, camera ) => new SVGFNode( convertToTexture( beautyNode ), depthNode, normalNode, velocityNode, camera );
