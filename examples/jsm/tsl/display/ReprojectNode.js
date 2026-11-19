import { DepthTexture, Node, RenderTarget } from 'three/webgpu';
import { texture, uniform, uv, vec2 } from 'three/tsl';

/**
 * Maps the current frame to the previous one, for effects that reuse data of the
 * previous frame like temporal anti-aliasing, denoising or reflections.
 *
 * The node outputs the UV a fragment had in the previous frame. It also provides
 * the previous frame's depth and camera matrices for validating the history.
 *
 * ```js
 * const reprojection = reproject( scenePassDepth, scenePassVelocity, camera );
 * const history = historyTexture.sample( reprojection );
 * ```
 *
 * @augments Node
 * @three_import import { reproject } from 'three/addons/tsl/display/ReprojectNode.js';
 */
class ReprojectNode extends Node {

	static get type() {

		return 'ReprojectNode';

	}

	/**
	 * Constructs a new reproject node.
	 *
	 * @param {TextureNode} depthNode - The scene's depth.
	 * @param {TextureNode} velocityNode - The scene's velocity.
	 * @param {Camera} camera - The camera the scene is rendered with.
	 */
	constructor( depthNode, velocityNode, camera ) {

		super( 'vec2' );

		/**
		 * The scene's depth.
		 *
		 * @type {TextureNode}
		 */
		this.depthNode = depthNode;

		/**
		 * The scene's velocity.
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
		 * The render target that holds the depth of the previous frame.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._previousDepthRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, depthTexture: new DepthTexture(), count: 0 } );
		this._previousDepthRenderTarget.depthTexture.name = 'ReprojectNode.previousDepth';

		/**
		 * The previous frame's depth.
		 *
		 * @type {TextureNode}
		 */
		this.previousDepthNode = texture( this._previousDepthRenderTarget.depthTexture );

		/**
		 * The camera's world matrix.
		 *
		 * @type {UniformNode<mat4>}
		 */
		this.cameraWorldMatrix = uniform( camera.matrixWorld );

		/**
		 * The camera's view matrix.
		 *
		 * @type {UniformNode<mat4>}
		 */
		this.cameraViewMatrix = uniform( camera.matrixWorldInverse );

		/**
		 * The camera's projection matrix inverse.
		 *
		 * @type {UniformNode<mat4>}
		 */
		this.cameraProjectionMatrixInverse = uniform( camera.projectionMatrixInverse );

		/**
		 * The previous frame's camera world matrix.
		 *
		 * @type {UniformNode<mat4>}
		 */
		this.previousCameraWorldMatrix = uniform( camera.matrixWorld.clone() );

		/**
		 * The previous frame's camera view matrix.
		 *
		 * @type {UniformNode<mat4>}
		 */
		this.previousCameraViewMatrix = uniform( camera.matrixWorldInverse.clone() );

		/**
		 * The previous frame's camera projection matrix.
		 *
		 * @type {UniformNode<mat4>}
		 */
		this.previousCameraProjectionMatrix = uniform( camera.projectionMatrix.clone() );

		/**
		 * The previous frame's camera projection matrix inverse.
		 *
		 * @type {UniformNode<mat4>}
		 */
		this.previousCameraProjectionMatrixInverse = uniform( camera.projectionMatrixInverse.clone() );

	}

	/**
	 * Returns the UV the surface at the given UV had in the previous frame.
	 *
	 * @param {Node<vec2>} uvNode - The UV in the current frame.
	 * @param {?Node<vec2>} [texel=null] - The texel to load the velocity from. By default, the velocity is sampled at the UV.
	 * @return {Node<vec2>} The UV in the previous frame.
	 */
	getHistoryUV( uvNode, texel = null ) {

		const velocity = texel !== null ? this.velocityNode.load( texel ) : this.velocityNode.sample( uvNode );

		// convert the NDC offset to UV offset

		return uvNode.sub( velocity.xy.mul( vec2( 0.5, - 0.5 ) ) );

	}

	/**
	 * Returns whether the stored depth has a different size, format or type from
	 * the current depth. Check before rendering to restart incompatible history.
	 *
	 * @return {boolean} Whether the history needs to be reset.
	 */
	needsHistoryReset() {

		const depth = this.depthNode.value;
		const previousDepth = this.previousDepthNode.value;

		return previousDepth.image.width !== depth.image.width ||
			previousDepth.image.height !== depth.image.height ||
			previousDepth.format !== depth.format ||
			previousDepth.type !== depth.type;

	}

	/**
	 * Stores the scene's depth and the camera matrices for the next frame. Call it
	 * once per frame after the effect has rendered.
	 *
	 * @param {Renderer} renderer - The renderer.
	 */
	update( renderer ) {

		const depth = this.depthNode.value;
		const previousDepth = this._previousDepthRenderTarget.depthTexture;

		const { width, height } = depth.image;

		if ( this.needsHistoryReset() ) {

			previousDepth.image.width = width;
			previousDepth.image.height = height;
			previousDepth.format = depth.format;
			previousDepth.type = depth.type;
			previousDepth.needsUpdate = true;

		}

		renderer.copyTextureToTexture( depth, previousDepth );

		this.previousCameraWorldMatrix.value.copy( this.camera.matrixWorld );
		this.previousCameraViewMatrix.value.copy( this.camera.matrixWorldInverse );
		this.previousCameraProjectionMatrix.value.copy( this.camera.projectionMatrix );
		this.previousCameraProjectionMatrixInverse.value.copy( this.camera.projectionMatrixInverse );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @return {Node<vec2>}
	 */
	setup() {

		return this.getHistoryUV( uv() );

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the node is no longer required.
	 */
	dispose() {

		super.dispose();

		this._previousDepthRenderTarget.dispose();

	}

}

export default ReprojectNode;

/**
 * TSL function for creating a reproject node.
 *
 * @tsl
 * @function
 * @param {TextureNode} depthNode - The scene's depth.
 * @param {TextureNode} velocityNode - The scene's velocity.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @returns {ReprojectNode}
 */
export const reproject = ( depthNode, velocityNode, camera ) => new ReprojectNode( depthNode, velocityNode, camera );
