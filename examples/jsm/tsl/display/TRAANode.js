import { HalfFloatType, Vector2, RenderTarget, RendererUtils, QuadMesh, NodeMaterial, TempNode, NodeUpdateType, Matrix4, DepthTexture } from 'three/webgpu';
import { add, float, If, Loop, int, Fn, min, max, clamp, nodeObject, texture, uniform, uv, vec2, vec4, luminance, convertToTexture, passTexture, velocity, getViewPosition, viewZToPerspectiveDepth, struct, screenSize, ivec2 } from 'three/tsl';

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
		 * When the difference between the current and previous depth goes above
		 * this threshold, the history is considered invalid.
		 *
		 * @type {number}
		 */
		this.depthThreshold = 0.0001;

		/**
		 * The depth difference within the 3×3 neighborhood to consider a pixel as an edge.
		 *
		 * @type {number}
		 */
		this.edgeDepthDiff = 0.0001;

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

		const currentDepthStruct = struct( {

			closestDepth: 'float',
			closestPositionTexel: 'ivec2',
			farthestDepth: 'float',

		} );

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

		const samplePreviousDepth = ( uv ) => {

			const depth = this._previousDepthNode.sample( uv ).r;
			const positionView = getViewPosition( uv, depth, this._previousCameraProjectionMatrixInverse );
			const positionWorld = this._previousCameraWorldMatrix.mul( vec4( positionView, 1 ) ).xyz;
			const viewZ = this._cameraWorldMatrixInverse.mul( vec4( positionWorld, 1 ) ).z;
			return viewZToPerspectiveDepth( viewZ, this._cameraNearFar.x, this._cameraNearFar.y );

		};

		// Optimized version of AABB clipping.
		// Reference: https://github.com/playdeadgames/temporal
		const clipAABB = Fn( ( [ current, history, minColor, maxColor ] ) => {

			const pClip = maxColor.rgb.add( minColor.rgb ).mul( 0.5 );
			const eClip = maxColor.rgb.sub( minColor.rgb ).mul( 0.5 ).add( 1e-7 );
			const vClip = history.sub( vec4( pClip, current.a ) );
			const vUnit = vClip.xyz.div( eClip );
			const absUnit = vUnit.abs();
			const maxUnit = max( absUnit.x, absUnit.y, absUnit.z );
			return maxUnit.greaterThan( 1 ).select(
				vec4( pClip, current.a ).add( vClip.div( maxUnit ) ),
				history
			);

		} ).setLayout( {
			name: 'clipAABB',
			type: 'vec4',
			inputs: [
				{ name: 'current', type: 'vec4' },
				{ name: 'history', type: 'vec4' },
				{ name: 'minColor', type: 'vec4' },
				{ name: 'maxColor', type: 'vec4' }
			]
		} );

		// Performs variance clipping.
		// See: https://developer.download.nvidia.com/gameworks/events/GDC2016/msalvi_temporal_supersampling.pdf
		const varianceClipping = ( positionTexel, currentColor, historyColor, gamma ) => {

			const varianceOffsets = [
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

			for ( const [ x, y ] of varianceOffsets ) {

				// Use max() to prevent NaN values from propagating.
				const neighbor = this.beautyNode.offset( ivec2( x, y ) ).load( positionTexel ).max( 0 );
				moment1.addAssign( neighbor );
				moment2.addAssign( neighbor.pow2() );

			}

			const N = float( varianceOffsets.length + 1 );
			const mean = moment1.div( N );
			const variance = moment2.div( N ).sub( mean.pow2() ).max( 0 ).sqrt().mul( gamma );
			const minColor = mean.sub( variance );
			const maxColor = mean.add( variance );

			return clipAABB( mean.clamp( minColor, maxColor ), historyColor, minColor, maxColor );

		};

		const historyNode = texture( this._historyRenderTarget.texture );

		const resolve = Fn( () => {

			const uvNode = uv();
			const positionTexel = uvNode.mul( screenSize );

			const currentDepthStruct = sampleCurrentDepth( positionTexel );
			const closestDepth = currentDepthStruct.get( 'closestDepth' );
			const closestPositionTexel = currentDepthStruct.get( 'closestPositionTexel' );
			const farthestDepth = currentDepthStruct.get( 'farthestDepth' );

			// sampling/reprojection

			const offset = this.velocityNode.load( closestPositionTexel ).xy.mul( vec2( 0.5, - 0.5 ) ); // NDC to uv offset

			const currentColor = this.beautyNode.sample( uvNode );
			const historyColor = historyNode.sample( uvNode.sub( offset ) );

			// neighborhood clipping

			const clippedHistoryColor = varianceClipping( positionTexel, currentColor, historyColor, 1 );

			// sample the current and previous depths

			const currentDepth = this.depthNode.sample( uvNode ).r;
			const historyUV = uvNode.sub( offset );
			const previousDepth = samplePreviousDepth( historyUV );

			// disocclusion except on edges

			const isEdge = farthestDepth.sub( closestDepth ).greaterThan( this.edgeDepthDiff );
			const isDisocclusion = currentDepth.sub( previousDepth ).greaterThan( this.depthThreshold ).and( isEdge.not() );

			// higher velocity = more weight on current frame
			// zero out history weight where disocclusion

			const motionFactor = uvNode.sub( historyUV ).length().mul( 10 );
			const currentWeight = isDisocclusion.select( 1, float( 0.05 ).add( motionFactor ).saturate() ).toVar();
			const historyWeight = currentWeight.oneMinus().toVar();

			// flicker reduction based on luminance weighing

			const compressedCurrent = currentColor.mul( float( 1 ).div( ( max( currentColor.r, currentColor.g, currentColor.b ).add( 1.0 ) ) ) );
			const compressedHistory = clippedHistoryColor.mul( float( 1 ).div( ( max( clippedHistoryColor.r, clippedHistoryColor.g, clippedHistoryColor.b ).add( 1.0 ) ) ) );

			const luminanceCurrent = luminance( compressedCurrent.rgb );
			const luminanceHistory = luminance( compressedHistory.rgb );

			currentWeight.mulAssign( float( 1 ).div( luminanceCurrent.add( 1 ) ) );
			historyWeight.mulAssign( float( 1 ).div( luminanceHistory.add( 1 ) ) );

			const smoothedOutput = add( currentColor.mul( currentWeight ), clippedHistoryColor.mul( historyWeight ) ).div( max( currentWeight.add( historyWeight ), 0.00001 ) ).toVar();

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
