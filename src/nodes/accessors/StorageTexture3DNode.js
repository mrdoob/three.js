import { nodeProxy, vec3 } from '../tsl/TSLBase.js';
import StorageTextureNode from './StorageTextureNode.js';

/**
 * This special version of a texture node can be used to
 * write data into a 3D storage texture with a compute shader.
 *
 * @augments StorageTextureNode
 */
class StorageTexture3DNode extends StorageTextureNode {

	static get type() {

		return 'StorageTexture3DNode';

	}

	/**
	 * Constructs a new 3D storage texture node.
	 *
	 * @param {Storage3DTexture} value - The 3D storage texture.
	 * @param {Node<vec3>} uvNode - The uv node.
	 * @param {?Node} [storeNode=null] - The value node that should be stored in the texture.
	 */
	constructor( value, uvNode, storeNode = null ) {

		super( value, uvNode, storeNode );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isStorageTexture3DNode = true;

	}

	/**
	 * Returns a default uv node which is in context of 3D textures a three-dimensional
	 * uv node.
	 *
	 * @return {Node<vec3>} The default uv node.
	 */
	getDefaultUV() {

		return vec3( 0.5, 0.5, 0.5 );

	}

	/**
	 * Overwritten with an empty implementation since the `updateMatrix` flag is ignored
	 * for 3D textures. The uv transformation matrix is not applied to 3D textures.
	 *
	 * @param {boolean} value - The update toggle.
	 */
	setUpdateMatrix( /*value*/ ) { } // Ignore .updateMatrix for 3d TextureNode

	/**
	 * Generates the uv code snippet.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {Node} uvNode - The uv node to generate code for.
	 * @return {string} The generated code snippet.
	 */
	generateUV( builder, uvNode ) {

		return uvNode.build( builder, this.sampler === true ? 'vec3' : 'ivec3' );

	}

	/**
	 * Generates the offset code snippet.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {Node} offsetNode - The offset node to generate code for.
	 * @return {string} The generated code snippet.
	 */
	generateOffset( builder, offsetNode ) {

		return offsetNode.build( builder, 'ivec3' );

	}

}

export default StorageTexture3DNode;

/**
 * TSL function for creating a 3D storage texture node.
 *
 * @tsl
 * @function
 * @param {Storage3DTexture} value - The 3D storage texture.
 * @param {?Node<vec3>} [uvNode=null] - The uv node.
 * @param {?Node} [storeNode=null] - The value node that should be stored in the texture.
 * @returns {StorageTexture3DNode}
 */
export const storageTexture3D = /*@__PURE__*/ nodeProxy( StorageTexture3DNode ).setParameterLength( 1, 3 );
