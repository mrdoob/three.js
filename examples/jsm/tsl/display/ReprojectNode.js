import { Matrix4, Node } from 'three/webgpu';
import { uniform, uv, vec2 } from 'three/tsl';

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
	 * @param {PassTextureNode} depthNode - The scene's depth. It must be a texture of a pass.
	 * @param {TextureNode} velocityNode - The scene's velocity.
	 * @param {Camera} camera - The camera the scene is rendered with.
	 */
	constructor( depthNode, velocityNode, camera ) {

		super( 'vec2' );

		/**
		 * The scene's depth.
		 *
		 * @type {PassTextureNode}
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
		 * The previous frame's depth.
		 *
		 * @type {PassTextureNode}
		 */
		this.previousDepthNode = depthNode.passNode.getPreviousTextureNode( depthNode.textureName );

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
	 * This method is used to setup the effect's TSL code.
	 *
	 * @return {Node<vec2>}
	 */
	setup() {

		return this.getHistoryUV( uv() );

	}

}

export default ReprojectNode;

/**
 * TSL function for creating a reproject node.
 *
 * @tsl
 * @function
 * @param {PassTextureNode} depthNode - The scene's depth. It must be a texture of a pass.
 * @param {TextureNode} velocityNode - The scene's velocity.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @returns {ReprojectNode}
 */
export const reproject = ( depthNode, velocityNode, camera ) => new ReprojectNode( depthNode, velocityNode, camera );
