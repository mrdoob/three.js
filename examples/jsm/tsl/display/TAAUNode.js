import { HalfFloatType, Vector2, RenderTarget, RendererUtils, QuadMesh, NodeMaterial, TempNode, NodeUpdateType, Matrix4, DepthTexture } from 'three/webgpu';
import { add, exp, float, If, Fn, max, texture, uniform, uv, vec2, vec4, luminance, convertToTexture, passTexture, velocity, getViewPosition, viewZToPerspectiveDepth, struct, ivec2, mix, property, outputStruct } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;


/**
 * A special node that performs Temporal Anti-Aliasing Upscaling (TAAU).
 *
 * Like TRAA, the node accumulates jittered samples over multiple frames and
 * reprojects history with motion vectors. Unlike TRAA, the input buffers
 * (beauty, depth, velocity) are expected to be rendered at a lower resolution
 * than the renderer's drawing buffer — typically by lowering the upstream
 * pass's resolution via {@link PassNode#setResolutionScale} — and the resolve
 * pass reconstructs an output-resolution image using a 9-tap Blackman-Harris
 * filter (Gaussian approximation) over the jittered input samples. The result
 * is an alternative to FSR2/3 that does anti-aliasing and upscaling in a
 * single pass.
 *
 * References:
 * - Karis, "High Quality Temporal Supersampling", SIGGRAPH 2014, {@link https://advances.realtimerendering.com/s2014/}
 * - Riley/Arcila, FidelityFX Super Resolution 2, GDC 2022, {@link https://gpuopen.com/download/GDC_FidelityFX_Super_Resolution_2_0.pdf}
 *
 * Note: MSAA must be disabled when TAAU is in use.
 *
 * @augments TempNode
 * @three_import import { taau } from 'three/addons/tsl/display/TAAUNode.js';
 */
class TAAUNode extends TempNode {

	static get type() {

		return 'TAAUNode';

	}

	/**
	 * Constructs a new TAAU node.
	 *
	 * @param {TextureNode} beautyNode - The texture node that represents the input of the effect.
	 * @param {TextureNode} depthNode - A node that represents the scene's depth.
	 * @param {TextureNode} velocityNode - A node that represents the scene's velocity.
	 * @param {Camera} camera - The camera the scene is rendered with.
	 */
	constructor( beautyNode, depthNode, velocityNode, camera ) {

		super( 'vec4' );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isTAAUNode = true;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * The texture node that represents the input of the effect.
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
		 * A node that represents the scene's velocity.
		 *
		 * @type {TextureNode}
		 */
		this.velocityNode = velocityNode;

		/**
		 * The camera the scene is rendered with.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;

		/**
		 * When the difference between the current and previous depth goes above this threshold,
		 * the history is considered invalid.
		 *
		 * @type {number}
		 * @default 0.0005
		 */
		this.depthThreshold = 0.0005;

		/**
		 * The depth difference within the 3×3 neighborhood to consider a pixel as an edge.
		 *
		 * @type {number}
		 * @default 0.001
		 */
		this.edgeDepthDiff = 0.001;

		/**
		 * The history becomes invalid as the pixel length of the velocity approaches this value.
		 *
		 * @type {number}
		 * @default 128
		 */
		this.maxVelocityLength = 128;

		/**
		 * Baseline weight applied to the current frame in the resolve. Lower
		 * values produce smoother results with longer accumulation but slower
		 * convergence on disoccluded regions; the motion factor is added on
		 * top, so fast-moving pixels still respond quickly.
		 *
		 * @type {number}
		 * @default 0.025
		 */
		this.currentFrameWeight = 0.025;

		/**
		 * The jitter index selects the current camera offset value.
		 *
		 * @private
		 * @type {number}
		 * @default 0
		 */
		this._jitterIndex = 0;

		/**
		 * A uniform node holding the current jitter offset in input-pixel
		 * units. The shader needs this to know where each input sample was
		 * actually rendered when computing per-tap reconstruction weights.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._jitterOffset = uniform( new Vector2() );

		/**
		 * The render target that represents the history of frame data.
		 * Sized to the renderer's drawing buffer (the output resolution).
		 *
		 * @private
		 * @type {?RenderTarget}
		 */
		this._historyRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType, count: 2 } );
		this._historyRenderTarget.textures[ 0 ].name = 'TAAUNode.history.color';
		this._historyRenderTarget.textures[ 1 ].name = 'TAAUNode.history.lock';

		/**
		 * The render target for the resolve. Sized to the renderer's drawing
		 * buffer (the output resolution).
		 *
		 * @private
		 * @type {?RenderTarget}
		 */
		this._resolveRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._resolveRenderTarget.texture.name = 'TAAUNode.resolve';

		/**
		 * Render target whose depth attachment holds the previous frame's
		 * depth buffer. The depth texture must be owned by a render target
		 * so that `copyTextureToTexture` can copy into it on the WebGL
		 * backend, which uses a framebuffer blit and therefore needs the
		 * destination depth texture to be attached to a framebuffer. This
		 * render target is sized independently of the history target so it
		 * can match the (lower-resolution) input depth texture.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._previousDepthRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, depthTexture: new DepthTexture() } );
		this._previousDepthRenderTarget.depthTexture.name = 'TAAUNode.previousDepth';

		/**
		 * Material used for the resolve step.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._resolveMaterial = new NodeMaterial();
		this._resolveMaterial.name = 'TAAU.resolve';

		/**
		 * Material used to seed the history render target on resize. It
		 * performs a bilinear upscale of the current beauty buffer into the
		 * output-sized history target so that the first frames after a
		 * resize do not fade in from black.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._seedMaterial = new NodeMaterial();
		this._seedMaterial.name = 'TAAU.seed';

		/**
		 * The result of the effect is represented as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._resolveRenderTarget.texture );

		/**
		 * Used to save the original/unjittered projection matrix.
		 *
		 * @private
		 * @type {Matrix4}
		 */
		this._originalProjectionMatrix = new Matrix4();

		/**
		 * A uniform node holding the camera's near and far.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._cameraNearFar = uniform( new Vector2() );

		/**
		 * A uniform node holding the camera world matrix.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraWorldMatrix = uniform( new Matrix4() );

		/**
		 * A uniform node holding the camera world matrix inverse.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraWorldMatrixInverse = uniform( new Matrix4() );

		/**
		 * A uniform node holding the camera projection matrix inverse.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraProjectionMatrixInverse = uniform( new Matrix4() );

		/**
		 * A uniform node holding the previous frame's view matrix.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._previousCameraWorldMatrix = uniform( new Matrix4() );

		/**
		 * A uniform node holding the previous frame's projection matrix inverse.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._previousCameraProjectionMatrixInverse = uniform( new Matrix4() );

		/**
		 * A texture node for the previous depth buffer.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._previousDepthNode = texture( this._previousDepthRenderTarget.depthTexture );

		/**
		 * Sync the post processing stack with the TAAU node.
		 *
		 * @private
		 * @type {boolean}
		 */
		this._needsPostProcessingSync = false;

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
	 * Sets the output size of the effect (history and resolve targets). The
	 * previous-depth texture is sized independently in `updateBefore()` to
	 * track the scene's current depth texture.
	 *
	 * @param {number} outputWidth - The output width (drawing buffer width).
	 * @param {number} outputHeight - The output height (drawing buffer height).
	 */
	setSize( outputWidth, outputHeight ) {

		this._historyRenderTarget.setSize( outputWidth, outputHeight );
		this._resolveRenderTarget.setSize( outputWidth, outputHeight );

	}

	/**
	 * Defines the TAAU's current jitter as a view offset to the scene's
	 * camera. The jitter is shrunk to one *output* pixel (rather than one
	 * input pixel) so that the halton sequence gradually fills the output
	 * sub-pixel grid over multiple frames.
	 *
	 * @param {number} inputWidth - The width of the input buffers the camera renders into.
	 * @param {number} inputHeight - The height of the input buffers the camera renders into.
	 */
	setViewOffset( inputWidth, inputHeight ) {

		// save original/unjittered projection matrix for velocity pass

		this.camera.updateProjectionMatrix();
		this._originalProjectionMatrix.copy( this.camera.projectionMatrix );

		velocity.setProjectionMatrix( this._originalProjectionMatrix );

		// The jitter range must span one output pixel (not one input pixel),
		// so we shrink the input-pixel-unit offset by the ratio of input to
		// output resolution.

		const haltonOffset = _haltonOffsets[ this._jitterIndex ];
		const jitterX = ( haltonOffset[ 0 ] - 0.5 );
		const jitterY = ( haltonOffset[ 1 ] - 0.5 );

		this._jitterOffset.value.set( jitterX, jitterY );

		this.camera.setViewOffset(

			inputWidth, inputHeight,

			jitterX, jitterY,

			inputWidth, inputHeight

		);

	}

	/**
	 * Clears the view offset from the scene's camera.
	 */
	clearViewOffset() {

		this.camera.clearViewOffset();

		velocity.setProjectionMatrix( null );

		// update jitter index

		this._jitterIndex ++;
		this._jitterIndex = this._jitterIndex % ( _haltonOffsets.length - 1 );

	}

	/**
	 * This method is used to render the effect once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		// store previous frame matrices before updating current ones

		this._previousCameraWorldMatrix.value.copy( this._cameraWorldMatrix.value );
		this._previousCameraProjectionMatrixInverse.value.copy( this._cameraProjectionMatrixInverse.value );

		// update camera matrices uniforms

		this._cameraNearFar.value.set( this.camera.near, this.camera.far );
		this._cameraWorldMatrix.value.copy( this.camera.matrixWorld );
		this._cameraWorldMatrixInverse.value.copy( this.camera.matrixWorldInverse );
		this._cameraProjectionMatrixInverse.value.copy( this.camera.projectionMatrixInverse );

		// extract input dimensions from the beauty buffer and output
		// dimensions from the renderer's drawing buffer

		const beautyRenderTarget = ( this.beautyNode.isRTTNode ) ? this.beautyNode.renderTarget : this.beautyNode.passNode.renderTarget;

		const inputWidth = beautyRenderTarget.texture.width;
		const inputHeight = beautyRenderTarget.texture.height;

		const drawingBufferSize = renderer.getDrawingBufferSize( _size );
		const outputWidth = drawingBufferSize.width;
		const outputHeight = drawingBufferSize.height;

		//

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		//

		const needsRestart =
			this._historyRenderTarget.width !== outputWidth ||
			this._historyRenderTarget.height !== outputHeight;

		this.setSize( outputWidth, outputHeight );

		// every time the dimensions change we need fresh history data

		if ( needsRestart === true ) {

			// make sure render targets are initialized after the resize which triggers a dispose()

			renderer.initRenderTarget( this._historyRenderTarget );
			renderer.initRenderTarget( this._resolveRenderTarget );

			// Seed the history with a bilinear upscale of the current beauty
			// buffer. Without this the first frames after a resize fade in
			// from black because the history target was cleared. The seed
			// material is a quad pass that samples beauty at output UVs, so
			// it produces an output-sized image regardless of the input size.

			renderer.setRenderTarget( this._historyRenderTarget );
			_quadMesh.material = this._seedMaterial;
			_quadMesh.name = 'TAAU.seed';
			_quadMesh.render( renderer );
			renderer.setRenderTarget( null );

		}

		// must run after needsRestart so it does not affect the seed reset

		if ( this._needsPostProcessingSync === true ) {

			this.setViewOffset( inputWidth, inputHeight );

			this._needsPostProcessingSync = false;

		}

		// resolve

		renderer.setRenderTarget( this._resolveRenderTarget );
		_quadMesh.material = this._resolveMaterial;
		_quadMesh.name = 'TAAU';
		_quadMesh.render( renderer );
		renderer.setRenderTarget( null );

		// update history

		renderer.copyTextureToTexture( this._resolveRenderTarget.texture, this._historyRenderTarget.texture );

		// Copy the current scene depth into the previous-depth texture. We
		// keep the destination size locked to the source's actual dimensions
		// so that any one-frame timing mismatch between the scene pass's depth
		// attachment and the beauty render target's bookkeeping cannot
		// produce a copy with mismatched extents (which WebGPU rejects for
		// depth/stencil formats).

		const currentDepth = this.depthNode.value;
		const srcW = currentDepth.image !== null && currentDepth.image !== undefined ? currentDepth.image.width : 0;
		const srcH = currentDepth.image !== null && currentDepth.image !== undefined ? currentDepth.image.height : 0;

		if ( srcW > 0 && srcH > 0 ) {

			if ( this._previousDepthRenderTarget.width !== srcW || this._previousDepthRenderTarget.height !== srcH ) {

				this._previousDepthRenderTarget.setSize( srcW, srcH );
				renderer.initRenderTarget( this._previousDepthRenderTarget );

			}

			const dstDepth = this._previousDepthRenderTarget.depthTexture;
			renderer.copyTextureToTexture( currentDepth, dstDepth );
			this._previousDepthNode.value = dstDepth;

		}

		// restore

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * This method is used to setup the effect's render targets and TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		const renderPipeline = builder.context.renderPipeline;

		if ( renderPipeline ) {

			this._needsPostProcessingSync = true;

			renderPipeline.context.onBeforeRenderPipeline = () => {

				const beautyRenderTarget = ( this.beautyNode.isRTTNode ) ? this.beautyNode.renderTarget : this.beautyNode.passNode.renderTarget;

				const inputWidth = beautyRenderTarget.texture.width;
				const inputHeight = beautyRenderTarget.texture.height;

				this.setViewOffset( inputWidth, inputHeight );

			};

			renderPipeline.context.onAfterRenderPipeline = () => {

				this.clearViewOffset();

			};

		}

		const currentDepthStruct = struct( {

			closestDepth: 'float',
			closestPositionTexel: 'vec2',
			farthestDepth: 'float',

		} );

		// Samples 3×3 neighborhood pixels and returns the closest and farthest depths.
		const sampleCurrentDepth = Fn( ( [ positionTexel ] ) => {

			const closestDepth = float( 2 ).toVar();
			const closestPositionTexel = vec2( 0 ).toVar();
			const farthestDepth = float( - 1 ).toVar();

			for ( let x = - 1; x <= 1; ++ x ) {

				for ( let y = - 1; y <= 1; ++ y ) {

					const neighbor = positionTexel.add( vec2( x, y ) ).toVar();
					const depth = this.depthNode.load( neighbor ).r.toVar();

					If( depth.lessThan( closestDepth ), () => {

						closestDepth.assign( depth );
						closestPositionTexel.assign( neighbor );

					} );

					If( depth.greaterThan( farthestDepth ), () => {

						farthestDepth.assign( depth );

					} );

				}

			}

			return currentDepthStruct( closestDepth, closestPositionTexel, farthestDepth );

		} );

		// Samples a previous depth and reproject it using the current camera matrices.
		const samplePreviousDepth = ( uv ) => {

			const depth = this._previousDepthNode.sample( uv ).r;
			const positionView = getViewPosition( uv, depth, this._previousCameraProjectionMatrixInverse );
			const positionWorld = this._previousCameraWorldMatrix.mul( vec4( positionView, 1 ) ).xyz;
			const viewZ = this._cameraWorldMatrixInverse.mul( vec4( positionWorld, 1 ) ).z;
			return viewZToPerspectiveDepth( viewZ, this._cameraNearFar.x, this._cameraNearFar.y );

		};

		// Optimized version of AABB clipping.
		// Reference: https://github.com/playdeadgames/temporal
		const clipAABB = Fn( ( [ currentColor, historyColor, minColor, maxColor ] ) => {

			const pClip = maxColor.rgb.add( minColor.rgb ).mul( 0.5 );
			const eClip = maxColor.rgb.sub( minColor.rgb ).mul( 0.5 ).add( 1e-7 );
			const vClip = historyColor.sub( vec4( pClip, currentColor.a ) );
			const vUnit = vClip.xyz.div( eClip );
			const absUnit = vUnit.abs();
			const maxUnit = max( absUnit.x, absUnit.y, absUnit.z );
			return maxUnit.greaterThan( 1 ).select(
				vec4( pClip, currentColor.a ).add( vClip.div( maxUnit ) ),
				historyColor
			);

		} ).setLayout( {
			name: 'clipAABB',
			type: 'vec4',
			inputs: [
				{ name: 'currentColor', type: 'vec4' },
				{ name: 'historyColor', type: 'vec4' },
				{ name: 'minColor', type: 'vec4' },
				{ name: 'maxColor', type: 'vec4' }
			]
		} );

		// Flicker reduction based on luminance weighing.
		const flickerReduction = Fn( ( [ currentColor, historyColor, currentWeight ] ) => {

			const historyWeight = currentWeight.oneMinus();
			const compressedCurrent = currentColor.mul( float( 1 ).div( ( max( currentColor.r, currentColor.g, currentColor.b ).add( 1 ) ) ) );
			const compressedHistory = historyColor.mul( float( 1 ).div( ( max( historyColor.r, historyColor.g, historyColor.b ).add( 1 ) ) ) );

			const luminanceCurrent = luminance( compressedCurrent.rgb );
			const luminanceHistory = luminance( compressedHistory.rgb );

			currentWeight.mulAssign( float( 1 ).div( luminanceCurrent.add( 1 ) ) );
			historyWeight.mulAssign( float( 1 ).div( luminanceHistory.add( 1 ) ) );

			return add( currentColor.mul( currentWeight ), historyColor.mul( historyWeight ) ).div( max( currentWeight.add( historyWeight ), 0.00001 ) ).toVar();

		} );

		const historyNode = texture( this._historyRenderTarget.textures[ 0 ] );
		const lockNode = texture( this._historyRenderTarget.textures[ 1 ] );

		// --- TAAU resolve ---
		//
		// For each output pixel, we map its position into input-pixel space,
		// find the closest jittered input sample, and reconstruct the current
		// color as a weighted sum of the 3×3 neighborhood around that sample.
		// Each tap's weight is a Gaussian approximation of a Blackman-Harris
		// window evaluated at the distance between the tap's (jittered)
		// sample center and the output pixel center. The same neighborhood
		// also supplies the moments used for variance clipping of the
		// reprojected history, so no second neighborhood read is needed.

		const colorOutput = property( 'vec4' );
		const lockOutput = property( 'vec4' );

		const outputNode = outputStruct( colorOutput, lockOutput );

		const resolve = Fn( () => {

			const uvNode = uv();
			const inputSize = this.beautyNode.size(); // ivec2
			const inputSizeF = vec2( inputSize );

			// output pixel center in input-pixel coordinates

			const pIn = uvNode.mul( inputSizeF );

			// the input sample at integer texel (m, n) was rendered at world
			// position (m + 0.5 + jitter). Solving for the closest tap gives:

			const closestTapF = pIn.sub( vec2( 0.5 ).add( this._jitterOffset ) ).round();
			const closestTap = ivec2( closestTapF );

			// depth dilation around the closest input tap

			const currentDepth = sampleCurrentDepth( closestTapF );
			const closestDepth = currentDepth.get( 'closestDepth' );
			const closestPositionTexel = currentDepth.get( 'closestPositionTexel' );
			const farthestDepth = currentDepth.get( 'farthestDepth' );

			// reproject using the velocity sampled at the dilated depth tap

			const offsetUV = this.velocityNode.load( closestPositionTexel ).xy.mul( vec2( 0.5, - 0.5 ) );
			const historyUV = uvNode.sub( offsetUV );
			const previousDepth = samplePreviousDepth( historyUV );

			// history validity

			const isValidUV = historyUV.greaterThanEqual( 0 ).all().and( historyUV.lessThanEqual( 1 ).all() );
			const isEdge = farthestDepth.sub( closestDepth ).greaterThan( this.edgeDepthDiff );
			const isDisocclusion = closestDepth.sub( previousDepth ).greaterThan( this.depthThreshold );
			const hasValidHistory = isValidUV.and( isEdge.or( isDisocclusion.not() ) );

			// 9-tap Blackman-Harris (Gaussian approximation) reconstruction
			// of the current frame color, plus moment accumulation for the
			// variance clip of the history.

			const sumColor = vec4( 0 ).toVar();
			const sumWeight = float( 0 ).toVar();
			const moment1 = vec4( 0 ).toVar();
			const moment2 = vec4( 0 ).toVar();

			const offsets = [
				[ - 1, - 1 ], [ 0, - 1 ], [ 1, - 1 ],
				[ - 1, 0 ], [ 0, 0 ], [ 1, 0 ],
				[ - 1, 1 ], [ 0, 1 ], [ 1, 1 ]
			];

			for ( const [ x, y ] of offsets ) {

				const tap = closestTap.add( ivec2( x, y ) );
				const tapCenter = vec2( tap ).add( vec2( 0.5 ).add( this._jitterOffset ) );
				const delta = pIn.sub( tapCenter );
				const d2 = delta.dot( delta );
				const w = exp( d2.mul( - 2.29 ) );

				// Use max() to prevent NaN values from propagating.
				const c = this.beautyNode.load( tap ).max( 0 );

				sumColor.addAssign( c.mul( w ) );
				sumWeight.addAssign( w );

				moment1.addAssign( c );
				moment2.addAssign( c.pow2() );

			}

			const currentColor = sumColor.div( sumWeight.max( 1e-5 ) );

			// variance clipping using the moments we just gathered

			const N = float( offsets.length );
			const mean = moment1.div( N );
			const motionFactor = uvNode.sub( historyUV ).mul( inputSizeF ).length().div( this.maxVelocityLength ).saturate();
			const varianceGamma = mix( 0.5, 1, motionFactor.oneMinus().pow2() );
			const variance = moment2.div( N ).sub( mean.pow2() ).max( 0 ).sqrt().mul( varianceGamma );
			const minColor = mean.sub( variance );
			const maxColor = mean.add( variance );

			const historyColor = historyNode.sample( historyUV );
			const clippedHistoryColor = clipAABB( mean.clamp( minColor, maxColor ), historyColor, minColor, maxColor );

			// Current weight. Under TAAU a single input frame covers less of
			// the output grid, so the baseline current weight is lower than
			// in standard TRAA to give the accumulator more frames to fill
			// in sub-pixel detail. Motion still biases toward the current
			// frame to keep disoccluded and fast-moving pixels responsive.

			const currentLuma = luminance( currentColor.rgb );
			const meanLuma = luminance( mean.rgb ).toConst();
			const thinFeature = currentLuma.sub( meanLuma ).abs().div( meanLuma ).smoothstep( 0, 0.2 );

			// Gate the lock by a two-sided depth change check. The
			// existing `isDisocclusion` is one-sided (only fires when
			// the scene moves farther), but new geometry appearing
			// closer also makes the history stale.
			const isDepthChanged = closestDepth.sub( previousDepth ).abs().greaterThan( this.depthThreshold );
			const canLock = isValidUV.and( isDepthChanged.not() );
			const gatedThinFeature = canLock.select( thinFeature, float( 0 ) );

			const decay = isDisocclusion.select( 0, 0.5 );
			const lock = max( gatedThinFeature, lockNode.r.mul( decay ) ).saturate();
			const lockedHistoryColor = mix( clippedHistoryColor, historyColor, lock );

			const currentWeight = float( this.currentFrameWeight ).toVar();
			currentWeight.assign( hasValidHistory.select( currentWeight.add( motionFactor ).saturate(), 1 ) );

			const output = flickerReduction( currentColor, lockedHistoryColor, currentWeight );

			colorOutput.assign( output );
			lockOutput.assign( lock );

			return vec4( 0 ); // temporary solution until TSL does not complain anymore

		} );

		// materials

		this._resolveMaterial.colorNode = resolve();
		this._resolveMaterial.outputNode = outputNode;

		this._seedMaterial.colorNode = Fn( () => {

			colorOutput.assign( this.beautyNode.sample( uv() ) );
			lockOutput.assign( 0 );

			return vec4( 0 );

		} )();

		this._seedMaterial.outputNode = outputNode;

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		this._historyRenderTarget.dispose();
		this._resolveRenderTarget.dispose();
		this._previousDepthRenderTarget.dispose();

		this._resolveMaterial.dispose();
		this._seedMaterial.dispose();

	}

}

export default TAAUNode;

function _halton( index, base ) {

	let fraction = 1;
	let result = 0;
	while ( index > 0 ) {

		fraction /= base;
		result += fraction * ( index % base );
		index = Math.floor( index / base );

	}

	return result;

}

const _haltonOffsets = /*@__PURE__*/ Array.from(
	{ length: 32 },
	( _, index ) => [ _halton( index + 1, 2 ), _halton( index + 1, 3 ) ]
);

/**
 * TSL function for creating a TAAU node for Temporal Anti-Aliasing Upscaling.
 *
 * @tsl
 * @function
 * @param {TextureNode} beautyNode - The texture node that represents the input of the effect.
 * @param {TextureNode} depthNode - A node that represents the scene's depth.
 * @param {TextureNode} velocityNode - A node that represents the scene's velocity.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @returns {TAAUNode}
 */
export const taau = ( beautyNode, depthNode, velocityNode, camera ) => new TAAUNode( convertToTexture( beautyNode ), depthNode, velocityNode, camera );
