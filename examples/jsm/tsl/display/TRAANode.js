import { HalfFloatType, Vector2, RenderTarget, RendererUtils, QuadMesh, NodeMaterial, TempNode, NodeUpdateType, Matrix4, DepthTexture, FloatType } from 'three/webgpu';
import { float, Fn, max, texture, uniform, uv, vec2, convertToTexture, passTexture, velocity, ivec2, mix, context, OnBeforeRenderPipeline, OnAfterRenderPipeline } from 'three/tsl';
import { clipAABB, computeHaltonOffsets, flickerReduction, sampleCurrentDepth, samplePreviousDepth } from '../utils/TAAUtils.js';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;


/**
 * A special node that applies TRAA (Temporal Reprojection Anti-Aliasing).
 *
 * References:
 * - {@link https://alextardif.com/TAA.html}
 * - {@link https://www.elopezr.com/temporal-aa-and-the-quest-for-the-holy-trail/}
 *
 * Note: MSAA must be disabled when TRAA is in use.
 *
 * @augments TempNode
 * @three_import import { traa } from 'three/addons/tsl/display/TRAANode.js';
 */
class TRAANode extends TempNode {

	static get type() {

		return 'TRAANode';

	}

	/**
	 * Constructs a new TRAA node.
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
		this.isTRAANode = true;

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
		 * A node that represents the scene's velocity.
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
		 * Whether to decrease the weight on the current frame when the velocity is more subpixel.
		 * This reduces blurriness under motion, but can introduce a square pattern artifact.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.useSubpixelCorrection = true;

		/**
		 * The jitter index selects the current camera offset value.
		 *
		 * @private
		 * @type {number}
		 * @default 0
		 */
		this._jitterIndex = 0;

		/**
		 * A uniform node holding the inverse resolution value.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._invSize = uniform( new Vector2() );

		/**
		 * The render target that represents the history of frame data.
		 *
		 * @private
		 * @type {?RenderTarget}
		 */
		this._historyRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType, depthTexture: new DepthTexture() } );
		this._historyRenderTarget.texture.name = 'TRAANode.history';

		/**
		 * The render target for the resolve.
		 *
		 * @private
		 * @type {?RenderTarget}
		 */
		this._resolveRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._resolveRenderTarget.texture.name = 'TRAANode.resolve';

		/**
		 * Material used for the resolve step.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._resolveMaterial = new NodeMaterial();
		this._resolveMaterial.name = 'TRAA.resolve';

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
		this._previousDepthNode = texture( new DepthTexture( 1, 1 ) );

		/**
		 * Sync the post processing stack with the TRAA node.
		 *
		 * @private
		 * @type {boolean}
		 */
		this._needsPostProcessingSync = false;

		/**
		 * The node used to render the scene's velocity.
		 *
		 * @private
		 * @type {?VelocityNode}
		 */
		this._velocityNode = null;

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

		this._historyRenderTarget.setSize( width, height );
		this._resolveRenderTarget.setSize( width, height );

		this._invSize.value.set( 1 / width, 1 / height );

	}

	/**
	 * Defines the TRAA's current jitter as a view offset
	 * to the scene's camera.
	 *
	 * @param {number} width - The width of the effect.
	 * @param {number} height - The height of the effect.
	 */
	setViewOffset( width, height ) {

		// save original/unjittered projection matrix for velocity pass

		this.camera.updateProjectionMatrix();
		this._originalProjectionMatrix.copy( this.camera.projectionMatrix );

		this._velocityNode.setProjectionMatrix( this._originalProjectionMatrix );

		//

		const viewOffset = {

			fullWidth: width,
			fullHeight: height,
			offsetX: 0,
			offsetY: 0,
			width: width,
			height: height

		};

		const jitterOffset = _haltonOffsets[ this._jitterIndex ];

		this.camera.setViewOffset(

			viewOffset.fullWidth, viewOffset.fullHeight,

			viewOffset.offsetX + jitterOffset[ 0 ] - 0.5, viewOffset.offsetY + jitterOffset[ 1 ] - 0.5,

			viewOffset.width, viewOffset.height

		);

	}

	/**
	 * Clears the view offset from the scene's camera.
	 */
	clearViewOffset() {

		this.camera.clearViewOffset();

		this._velocityNode.setProjectionMatrix( null );

		// update jitter index

		this._jitterIndex ++;
		this._jitterIndex = this._jitterIndex % _haltonOffsets.length;

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

		// keep the TRAA in sync with the dimensions of the beauty node

		const beautyRenderTarget = ( this.beautyNode.isRTTNode ) ? this.beautyNode.renderTarget : this.beautyNode.passNode.renderTarget;

		const width = beautyRenderTarget.texture.width;
		const height = beautyRenderTarget.texture.height;

		//

		if ( this._needsPostProcessingSync === true ) {

			this.setViewOffset( width, height );

			this._needsPostProcessingSync = false;

		}

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		//

		const needsRestart = this._historyRenderTarget.width !== width || this._historyRenderTarget.height !== height;
		this.setSize( width, height );

		// every time when the dimensions change we need fresh history data

		if ( needsRestart === true ) {

			// make sure render targets are initialized after the resize which triggers a dispose()

			renderer.initRenderTarget( this._historyRenderTarget );
			renderer.initRenderTarget( this._resolveRenderTarget );

			// make sure to reset the history with the contents of the beauty buffer otherwise subsequent frames after the
			// resize will fade from a darker color to the correct one because the history was cleared with black.

			renderer.copyTextureToTexture( beautyRenderTarget.texture, this._historyRenderTarget.texture );

		}

		// resolve

		renderer.setRenderTarget( this._resolveRenderTarget );
		_quadMesh.material = this._resolveMaterial;
		_quadMesh.name = 'TRAA';
		_quadMesh.render( renderer );
		renderer.setRenderTarget( null );

		// update history

		renderer.copyTextureToTexture( this._resolveRenderTarget.texture, this._historyRenderTarget.texture );

		// Copy current depth to previous depth buffer

		const size = renderer.getDrawingBufferSize( _size );

		// only allow the depth copy if the dimensions of the history render target match with the drawing
		// render buffer and thus the depth texture of the scene. For some reasons, there are timing issues
		// with WebGPU resulting in different size of the drawing buffer and the beauty render target when
		// resizing the browser window. This does not happen with the WebGL backend

		if ( this._historyRenderTarget.height === size.height && this._historyRenderTarget.width === size.width ) {

			const currentDepth = this.depthNode.value;
			renderer.copyTextureToTexture( currentDepth, this._historyRenderTarget.depthTexture );
			this._previousDepthNode.value = this._historyRenderTarget.depthTexture;

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

		if ( builder.renderPipeline && ! builder.context.renderPipelineState.viewOffsetOwner ) {

			builder.context.renderPipelineState.viewOffsetOwner = this;

			this._needsPostProcessingSync = true;

			OnBeforeRenderPipeline( () => {

				const size = builder.renderer.getDrawingBufferSize( _size );
				this.setViewOffset( size.width, size.height );

			} );

			OnAfterRenderPipeline( () => {

				this.clearViewOffset();

			} );

		}

		if ( builder.renderer.reversedDepthBuffer === true ) {

			this._historyRenderTarget.depthTexture.type = FloatType;

		}

		if ( builder.context.velocity !== undefined ) {

			this._velocityNode = builder.context.velocity;

		} else {

			this._velocityNode = velocity;

		}

		// Performs variance clipping.
		// See: https://developer.download.nvidia.com/gameworks/events/GDC2016/msalvi_temporal_supersampling.pdf
		const varianceClipping = Fn( ( [ positionTexel, currentColor, historyColor, gamma ] ) => {

			const offsets = [
				[ - 1, - 1 ],
				[ - 1, 1 ],
				[ 1, - 1 ],
				[ 1, 1 ],
				[ 1, 0 ],
				[ 0, - 1 ],
				[ 0, 1 ],
				[ - 1, 0 ]
			];

			const moment1 = currentColor.toVar();
			const moment2 = currentColor.pow2().toVar();

			for ( const [ x, y ] of offsets ) {

				// Use max() to prevent NaN values from propagating.
				const neighbor = this.beautyNode.offset( ivec2( x, y ) ).load( positionTexel ).max( 0 );
				moment1.addAssign( neighbor );
				moment2.addAssign( neighbor.pow2() );

			}

			const N = float( offsets.length + 1 );
			const mean = moment1.div( N );
			const variance = moment2.div( N ).sub( mean.pow2() ).max( 0 ).sqrt().mul( gamma );
			const minColor = mean.sub( variance );
			const maxColor = mean.add( variance );

			return clipAABB( mean.clamp( minColor, maxColor ), historyColor, minColor, maxColor );

		} );

		// Returns the amount of subpixel (expressed within [0, 1]) in the velocity.
		const subpixelCorrection = Fn( ( [ velocityUV, textureSize ] ) => {

			const velocityTexel = velocityUV.mul( textureSize );
			const phase = velocityTexel.fract().abs();
			const weight = max( phase, phase.oneMinus() );
			return weight.x.mul( weight.y ).oneMinus().div( 0.75 );

		} ).setLayout( {
			name: 'subpixelCorrection',
			type: 'float',
			inputs: [
				{ name: 'velocityUV', type: 'vec2' },
				{ name: 'textureSize', type: 'ivec2' }
			]
		} );

		const historyNode = texture( this._historyRenderTarget.texture );

		const resolve = Fn( () => {

			const uvNode = uv();
			const textureSize = this.beautyNode.size(); // Assumes all the buffers share the same size.
			const positionTexel = uvNode.mul( textureSize );

			// sample the closest and farthest depths in the current buffer

			const currentDepth = sampleCurrentDepth( this.depthNode, positionTexel, this._cameraNearFar );
			const closestDepth = currentDepth.get( 'closestDepth' );
			const closestPositionTexel = currentDepth.get( 'closestPositionTexel' );
			const farthestDepth = currentDepth.get( 'farthestDepth' );

			// convert the NDC offset to UV offset

			const offsetUV = this.velocityNode.load( closestPositionTexel ).xy.mul( vec2( 0.5, - 0.5 ) );

			// sample the previous depth

			const historyUV = uvNode.sub( offsetUV );
			const previousDepth = samplePreviousDepth( this._previousDepthNode, historyUV, this._previousCameraProjectionMatrixInverse, this._previousCameraWorldMatrix, this._cameraWorldMatrixInverse, this._cameraNearFar, this.camera );

			// history is considered valid when the UV is in range and there's no disocclusion except on edges

			const isValidUV = historyUV.greaterThanEqual( 0 ).all().and( historyUV.lessThanEqual( 1 ).all() );
			const isEdge = farthestDepth.sub( closestDepth ).greaterThan( this.edgeDepthDiff );
			const isDisocclusion = closestDepth.sub( previousDepth ).greaterThan( this.depthThreshold );
			const hasValidHistory = isValidUV.and( isEdge.or( isDisocclusion.not() ) );

			// sample the current and previous colors

			const currentColor = this.beautyNode.sample( uvNode );
			const historyColor = historyNode.sample( historyUV );

			// increase the weight towards the current frame under motion

			const motionFactor = uvNode.sub( historyUV ).mul( textureSize ).length().div( this.maxVelocityLength ).saturate();
			const currentWeight = float( 0.05 ).toVar(); // A minimum weight

			if ( this.useSubpixelCorrection ) {

				// Increase the minimum weight towards the current frame when the velocity is more subpixel.
				currentWeight.addAssign( subpixelCorrection( offsetUV, textureSize ).mul( 0.25 ) );

			}

			currentWeight.assign( hasValidHistory.select( currentWeight.add( motionFactor ).saturate(), 1 ) );

			// Perform neighborhood clipping/clamping. We use variance clipping here.

			const varianceGamma = mix( 0.5, 1, motionFactor.oneMinus().pow2() ); // Reasonable gamma range is [0.75, 2]
			const clippedHistoryColor = varianceClipping( positionTexel, currentColor, historyColor, varianceGamma );

			// flicker reduction based on luminance weighing

			const output = flickerReduction( currentColor, clippedHistoryColor, currentWeight );

			return output;

		} );

		// materials

		this._resolveMaterial.contextNode = context( builder.getSharedContext() );
		this._resolveMaterial.colorNode = resolve();

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		super.dispose();

		this._historyRenderTarget.dispose();
		this._resolveRenderTarget.dispose();

		this._resolveMaterial.dispose();

	}

}

export default TRAANode;

const _haltonOffsets = /*@__PURE__*/ computeHaltonOffsets( 32 );

/**
 * TSL function for creating a TRAA node for Temporal Reprojection Anti-Aliasing.
 *
 * @tsl
 * @function
 * @param {TextureNode} beautyNode - The texture node that represents the input of the effect.
 * @param {TextureNode} depthNode - A node that represents the scene's depth.
 * @param {TextureNode} velocityNode - A node that represents the scene's velocity.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @returns {TRAANode}
 */
export const traa = ( beautyNode, depthNode, velocityNode, camera ) => new TRAANode( convertToTexture( beautyNode ), depthNode, velocityNode, camera );
