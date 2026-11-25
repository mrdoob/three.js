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
	 * @param {?TextureNode} [previousDepthNode=null] - The previous frame's depth, e.g. from
	 * `PassNode.getPreviousTextureNode()`. When omitted, the depth is copied in `update()`.
	 */
	constructor( depthNode, velocityNode, camera, previousDepthNode = null ) {

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
		 * The render target that holds the depth of the previous frame. It is `null`
		 * when the previous depth is provided.
		 *
		 * @private
		 * @type {?RenderTarget}
		 */
		this._previousDepthRenderTarget = null;

		if ( previousDepthNode === null ) {

			this._previousDepthRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, depthTexture: new DepthTexture(), count: 0 } );
			this._previousDepthRenderTarget.depthTexture.name = 'Reprojection.previousDepth';

			previousDepthNode = texture( this._previousDepthRenderTarget.depthTexture );

		}

		/**
		 * The previous frame's depth.
		 *
		 * @type {TextureNode}
		 */
		this.previousDepthNode = previousDepthNode;

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

		/**
		 * The camera matrices and depth size stored by the last `update()` or `advance()`.
		 *
		 * @private
		 */
		this._cameraWorldMatrix = camera.matrixWorld.clone();
		this._cameraViewMatrix = camera.matrixWorldInverse.clone();
		this._cameraProjectionMatrix = camera.projectionMatrix.clone();
		this._cameraProjectionMatrixInverse = camera.projectionMatrixInverse.clone();
		this._width = 0;
		this._height = 0;

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

		// a provided previous depth is resized together with the current one

		if ( this._previousDepthRenderTarget === null ) return this._width !== depth.image.width || this._height !== depth.image.height;

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

		if ( this._previousDepthRenderTarget !== null ) {

			const previousDepth = this._previousDepthRenderTarget.depthTexture;

			if ( this.needsHistoryReset() ) {

				previousDepth.image.width = depth.image.width;
				previousDepth.image.height = depth.image.height;
				previousDepth.format = depth.format;
				previousDepth.type = depth.type;
				previousDepth.needsUpdate = true;

			}

			renderer.copyTextureToTexture( depth, previousDepth );

		}

		// store the current matrices first so they become the previous ones

		this._storeCamera();
		this.advance();

	}

	/**
	 * Makes the camera matrices stored by the last call the previous ones and stores
	 * the current ones. Call it once per frame before the history is read, instead of
	 * `update()`, when the previous depth is provided and nothing renders in between.
	 */
	advance() {

		this.previousCameraWorldMatrix.value.copy( this._cameraWorldMatrix );
		this.previousCameraViewMatrix.value.copy( this._cameraViewMatrix );
		this.previousCameraProjectionMatrix.value.copy( this._cameraProjectionMatrix );
		this.previousCameraProjectionMatrixInverse.value.copy( this._cameraProjectionMatrixInverse );

		this._storeCamera();

	}

	_storeCamera() {

		const { camera } = this;
		const { width, height } = this.depthNode.value.image;

		this._cameraWorldMatrix.copy( camera.matrixWorld );
		this._cameraViewMatrix.copy( camera.matrixWorldInverse );
		this._cameraProjectionMatrix.copy( camera.projectionMatrix );
		this._cameraProjectionMatrixInverse.copy( camera.projectionMatrixInverse );
		this._width = width;
		this._height = height;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the reprojection is no longer required.
	 */
	dispose() {

		if ( this._previousDepthRenderTarget !== null ) this._previousDepthRenderTarget.dispose();

	}

}

export { Reprojection };
