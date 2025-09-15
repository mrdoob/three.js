import { HalfFloatType, Vector2, RenderTarget, RendererUtils, QuadMesh, NodeMaterial, TempNode, NodeUpdateType, Matrix4, DepthTexture } from 'three/webgpu';
import { add, float, If, Loop, int, Fn, min, max, clamp, nodeObject, texture, uniform, uv, vec2, vec4, luminance, convertToTexture, passTexture, velocity, getViewPosition, length } from 'three/tsl';

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
		 *  The camera the scene is rendered with.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;

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
		 * A uniform node holding the camera world matrix.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraWorldMatrix = uniform( new Matrix4() );

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
		 * A texture node for the previous depth buffer.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._previousDepthNode = texture( new DepthTexture( 1, 1 ) );

		/**
		 * Sync the post processing stack with the TRAA node.
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

		velocity.setProjectionMatrix( this._originalProjectionMatrix );

		//

		const viewOffset = {

			fullWidth: width,
			fullHeight: height,
			offsetX: 0,
			offsetY: 0,
			width: width,
			height: height

		};

		const jitterOffset = _JitterVectors[ this._jitterIndex ];

		this.camera.setViewOffset(

			viewOffset.fullWidth, viewOffset.fullHeight,

			viewOffset.offsetX + jitterOffset[ 0 ] * 0.0625, viewOffset.offsetY + jitterOffset[ 1 ] * 0.0625, // 0.0625 = 1 / 16

			viewOffset.width, viewOffset.height

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
		this._jitterIndex = this._jitterIndex % ( _JitterVectors.length - 1 );

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

		this._cameraWorldMatrix.value.copy( this.camera.matrixWorld );
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

			// bind and clear render target to make sure they are initialized after the resize which triggers a dispose()

			renderer.setRenderTarget( this._historyRenderTarget );
			renderer.clear();

			renderer.setRenderTarget( this._resolveRenderTarget );
			renderer.clear();

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

		const postProcessing = builder.context.postProcessing;

		if ( postProcessing ) {

			this._needsPostProcessingSync = true;

			postProcessing.context.onBeforePostProcessing = () => {

				const size = builder.renderer.getDrawingBufferSize( _size );
				this.setViewOffset( size.width, size.height );

			};

			postProcessing.context.onAfterPostProcessing = () => {

				this.clearViewOffset();

			};

		}

		const historyTexture = texture( this._historyRenderTarget.texture );
		const sampleTexture = this.beautyNode;
		const depthTexture = this.depthNode;
		const velocityTexture = this.velocityNode;

		const resolve = Fn( () => {

			const uvNode = uv();

			const minColor = vec4( 10000 ).toVar();
			const maxColor = vec4( - 10000 ).toVar();
			const closestDepth = float( 1 ).toVar();
			const farthestDepth = float( 0 ).toVar();
			const closestDepthPixelPosition = vec2( 0 ).toVar();

			// sample a 3x3 neighborhood to create a box in color space
			// clamping the history color with the resulting min/max colors mitigates ghosting

			Loop( { start: int( - 1 ), end: int( 1 ), type: 'int', condition: '<=', name: 'x' }, ( { x } ) => {

				Loop( { start: int( - 1 ), end: int( 1 ), type: 'int', condition: '<=', name: 'y' }, ( { y } ) => {

					const uvNeighbor = uvNode.add( vec2( float( x ), float( y ) ).mul( this._invSize ) ).toVar();
					const colorNeighbor = max( vec4( 0 ), sampleTexture.sample( uvNeighbor ) ).toVar(); // use max() to avoid propagate garbage values

					minColor.assign( min( minColor, colorNeighbor ) );
					maxColor.assign( max( maxColor, colorNeighbor ) );

					const currentDepth = depthTexture.sample( uvNeighbor ).r.toVar();

					// find the sample position of the closest depth in the neighborhood (used for velocity)

					If( currentDepth.lessThan( closestDepth ), () => {

						closestDepth.assign( currentDepth );
						closestDepthPixelPosition.assign( uvNeighbor );

					} );

					// find the farthest depth in the neighborhood (used to preserve edge anti-aliasing)

					If( currentDepth.greaterThan( farthestDepth ), () => {

						farthestDepth.assign( currentDepth );

					} );

				} );

			} );

			// sampling/reprojection

			const offset = velocityTexture.sample( closestDepthPixelPosition ).xy.mul( vec2( 0.5, - 0.5 ) ); // NDC to uv offset

			const currentColor = sampleTexture.sample( uvNode );
			const historyColor = historyTexture.sample( uvNode.sub( offset ) );

			// clamping

			const clampedHistoryColor = clamp( historyColor, minColor, maxColor );

			// calculate current frame world position

			const currentDepth = depthTexture.sample( uvNode ).r;
			const currentViewPosition = getViewPosition( uvNode, currentDepth, this._cameraProjectionMatrixInverse );
			const currentWorldPosition = this._cameraWorldMatrix.mul( vec4( currentViewPosition, 1.0 ) ).xyz;

			// calculate previous frame world position from history UV and previous depth

			const historyUV = uvNode.sub( offset );
			const previousDepth = this._previousDepthNode.sample( historyUV ).r;
			const previousViewPosition = getViewPosition( historyUV, previousDepth, this._previousCameraProjectionMatrixInverse );
			const previousWorldPosition = this._previousCameraWorldMatrix.mul( vec4( previousViewPosition, 1.0 ) ).xyz;

			// calculate difference in world positions

			const worldPositionDifference = length( currentWorldPosition.sub( previousWorldPosition ) ).toVar();
			worldPositionDifference.assign( min( max( worldPositionDifference.sub( 1.0 ), 0.0 ), 1.0 ) );

			const currentWeight = float( 0.05 ).toVar();
			const historyWeight = currentWeight.oneMinus().toVar();

			// zero out history weight if world positions are different (indicating motion) except on edges

			const rejectPixel = worldPositionDifference.greaterThan( 0.01 ).and( farthestDepth.sub( closestDepth ).lessThan( 0.0001 ) );
			If( rejectPixel, () => {

				currentWeight.assign( 1.0 );
				historyWeight.assign( 0.0 );

			} );

			// flicker reduction based on luminance weighing

			const compressedCurrent = currentColor.mul( float( 1 ).div( ( max( currentColor.r, currentColor.g, currentColor.b ).add( 1.0 ) ) ) );
			const compressedHistory = clampedHistoryColor.mul( float( 1 ).div( ( max( clampedHistoryColor.r, clampedHistoryColor.g, clampedHistoryColor.b ).add( 1.0 ) ) ) );

			const luminanceCurrent = luminance( compressedCurrent.rgb );
			const luminanceHistory = luminance( compressedHistory.rgb );

			currentWeight.mulAssign( float( 1.0 ).div( luminanceCurrent.add( 1 ) ) );
			historyWeight.mulAssign( float( 1.0 ).div( luminanceHistory.add( 1 ) ) );

			const smoothedOutput = add( currentColor.mul( currentWeight ), clampedHistoryColor.mul( historyWeight ) ).div( max( currentWeight.add( historyWeight ), 0.00001 ) ).toVar();

			return smoothedOutput;

		} );

		// materials

		this._resolveMaterial.colorNode = resolve();

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		this._historyRenderTarget.dispose();
		this._resolveRenderTarget.dispose();

		this._resolveMaterial.dispose();

	}

}

export default TRAANode;

// These jitter vectors are specified in integers because it is easier.
// I am assuming a [-8,8) integer grid, but it needs to be mapped onto [-0.5,0.5)
// before being used, thus these integers need to be scaled by 1/16.
//
// Sample patterns reference: https://msdn.microsoft.com/en-us/library/windows/desktop/ff476218%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396
const _JitterVectors = [
	[ - 4, - 7 ], [ - 7, - 5 ], [ - 3, - 5 ], [ - 5, - 4 ],
	[ - 1, - 4 ], [ - 2, - 2 ], [ - 6, - 1 ], [ - 4, 0 ],
	[ - 7, 1 ], [ - 1, 2 ], [ - 6, 3 ], [ - 3, 3 ],
	[ - 7, 6 ], [ - 3, 6 ], [ - 5, 7 ], [ - 1, 7 ],
	[ 5, - 7 ], [ 1, - 6 ], [ 6, - 5 ], [ 4, - 4 ],
	[ 2, - 3 ], [ 7, - 2 ], [ 1, - 1 ], [ 4, - 1 ],
	[ 2, 1 ], [ 6, 2 ], [ 0, 4 ], [ 4, 4 ],
	[ 2, 5 ], [ 7, 5 ], [ 5, 6 ], [ 3, 7 ]
];

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
export const traa = ( beautyNode, depthNode, velocityNode, camera ) => nodeObject( new TRAANode( convertToTexture( beautyNode ), depthNode, velocityNode, camera ) );
