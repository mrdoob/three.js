import { DepthTexture, RenderTarget } from 'three/webgpu';
import { getViewPosition, projectionDepth, texture, uniform, vec2, vec4, viewZToOrthographicDepth, viewZToPerspectiveDepth } from 'three/tsl';

/**
 * Maps the current frame to the previous one, for effects that reuse data of the
 * previous frame like temporal anti-aliasing, denoising or reflections.
 *
 * It holds the previous frame's depth and camera matrices for validating the history.
 *
 * Note: This class can only be used with `WebGPURenderer`.
 *
 * @private
 */
class Reprojection {

	/**
	 * Constructs a new reprojection.
	 *
	 * @param {TextureNode} depthNode - The scene's depth.
	 * @param {TextureNode} velocityNode - The scene's velocity.
	 * @param {Camera} camera - The camera the scene is rendered with.
	 */
	constructor( depthNode, velocityNode, camera ) {

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
		this._previousDepthRenderTarget.depthTexture.name = 'Reprojection.previousDepth';

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
	 * @param {Node<ivec2>} texel - The texel to load the velocity from.
	 * @return {Node<vec2>} The UV in the previous frame.
	 */
	getHistoryUV( uvNode, texel ) {

		const velocity = this.velocityNode.load( texel );

		// convert the NDC offset to UV offset

		return uvNode.sub( velocity.xy.mul( vec2( 0.5, - 0.5 ) ) );

	}

	/**
	 * Samples the previous frame's depth at the given UV and reprojects it into the current view.
	 *
	 * @param {Node<vec2>} uvNode - The UV in the previous frame.
	 * @param {Node<vec2>} cameraNearFar - The camera's near and far.
	 * @return {Node<float>} The reprojected depth.
	 */
	getPreviousDepth( uvNode, cameraNearFar ) {

		const depth = projectionDepth( this.previousDepthNode.sample( uvNode ).r, cameraNearFar.x, cameraNearFar.y );
		const positionView = getViewPosition( uvNode, depth, this.previousCameraProjectionMatrixInverse );
		const positionWorld = this.previousCameraWorldMatrix.mul( vec4( positionView, 1 ) ).xyz;
		const viewZ = this.cameraViewMatrix.mul( vec4( positionWorld, 1 ) ).z;

		return this.camera.isOrthographicCamera
			? viewZToOrthographicDepth( viewZ, cameraNearFar.x, cameraNearFar.y )
			: viewZToPerspectiveDepth( viewZ, cameraNearFar.x, cameraNearFar.y );

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
	 * Frees internal resources. This method should be called
	 * when the reprojection is no longer required.
	 */
	dispose() {

		this._previousDepthRenderTarget.dispose();

	}

}

export { Reprojection };
