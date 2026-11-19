import { DepthTexture, Matrix4, Node, RenderTarget } from 'three/webgpu';
import { texture, uniform, uv, vec2 } from 'three/tsl';

// a uniform holding the value the given matrix had in the previous frame

const previous = ( matrix ) => {

	const current = new Matrix4();

	return uniform( new Matrix4() ).onFrameUpdate( ( frame, self ) => {

		self.value.copy( current );
		current.copy( matrix );

	} );

};

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
		 * The camera's view matrix.
		 *
		 * @type {UniformNode<mat4>}
		 */
		this.cameraViewMatrix = uniform( camera.matrixWorldInverse );

		/**
		 * The previous frame's camera world matrix.
		 *
		 * @type {UniformNode<mat4>}
		 */
		this.previousCameraWorldMatrix = previous( camera.matrixWorld );

		/**
		 * The previous frame's camera projection matrix inverse.
		 *
		 * @type {UniformNode<mat4>}
		 */
		this.previousCameraProjectionMatrixInverse = previous( camera.projectionMatrixInverse );

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
	 * Stores the scene's depth for the next frame. Call it once per frame after
	 * the previous depth has been read.
	 *
	 * @param {Renderer} renderer - The renderer.
	 */
	update( renderer ) {

		const depth = this.depthNode.value;
		const previousDepth = this._previousDepthRenderTarget.depthTexture;

		const { width, height } = depth.image;

		if ( previousDepth.image.width !== width || previousDepth.image.height !== height ) {

			previousDepth.image.width = width;
			previousDepth.image.height = height;
			previousDepth.format = depth.format;
			previousDepth.type = depth.type;
			previousDepth.needsUpdate = true;

		}

		renderer.copyTextureToTexture( depth, previousDepth );

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
