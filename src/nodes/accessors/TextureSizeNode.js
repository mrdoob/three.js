import Node from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLBase.js';

/**
 * A node that represents the dimensions of a texture. The texture size is
 * retrieved in the shader via built-in shader functions like `textureDimensions()`
 * or `textureSize()`.
 *
 * @augments Node
 */
class TextureSizeNode extends Node {

	static get type() {

		return 'TextureSizeNode';

	}

	/**
	 * Constructs a new texture size node.
	 *
	 * @param {TextureNode} textureNode - A texture node which size should be retrieved.
	 * @param {?Node<int>} [levelNode=null] - A level node which defines the requested mip.
	 */
	constructor( textureNode, levelNode = null ) {

		super( 'uvec2' );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isTextureSizeNode = true;

		/**
		 * A texture node which size should be retrieved.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * A level node which defines the requested mip.
		 *
		 * @type {Node<int>}
		 * @default null
		 */
		this.levelNode = levelNode;

	}

	generate( builder, output ) {

		const textureProperty = this.textureNode.build( builder, 'property' );
		const level = this.levelNode === null ? '0' : this.levelNode.build( builder, 'int' );

		return builder.format( `${ builder.getMethod( 'textureDimensions' ) }( ${ textureProperty }, ${ level } )`, this.getNodeType( builder ), output );

	}

}

export default TextureSizeNode;

/**
 * TSL function for creating a texture size node.
 *
 * @tsl
 * @function
 * @param {TextureNode} textureNode - A texture node which size should be retrieved.
 * @param {?Node<int>} [levelNode=null] - A level node which defines the requested mip.
 * @returns {TextureSizeNode}
 */
export const textureSize = /*@__PURE__*/ nodeProxy( TextureSizeNode );
