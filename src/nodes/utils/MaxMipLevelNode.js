import UniformNode from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy } from '../tsl/TSLBase.js';

/**
 * A special type of uniform node that computes the
 * maximum mipmap level for a given texture node.
 *
 * ```js
 * const level = maxMipLevel( textureNode );
 * ```
 *
 * @augments UniformNode
 */
class MaxMipLevelNode extends UniformNode {

	static get type() {

		return 'MaxMipLevelNode';

	}

	/**
	 * Constructs a new max mip level node.
	 *
	 * @param {TextureNode} textureNode - The texture node to compute the max mip level for.
	 */
	constructor( textureNode ) {

		super( 0 );

		/**
		 * The texture node to compute the max mip level for.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._textureNode = textureNode;

		/**
		 * The `updateType` is set to `NodeUpdateType.FRAME` since the node updates
		 * the texture once per frame in its {@link MaxMipLevelNode#update} method.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateType = NodeUpdateType.FRAME;

	}

	/**
	 * The texture node to compute the max mip level for.
	 *
	 * @readonly
	 * @type {TextureNode}
	 */
	get textureNode() {

		return this._textureNode;

	}

	/**
	 * The texture.
	 *
	 * @readonly
	 * @type {Texture}
	 */
	get texture() {

		return this._textureNode.value;

	}

	update() {

		const texture = this.texture;
		const images = texture.images;
		const image = ( images && images.length > 0 ) ? ( ( images[ 0 ] && images[ 0 ].image ) || images[ 0 ] ) : texture.image;

		if ( image && image.width !== undefined ) {

			const { width, height } = image;

			this.value = Math.log2( Math.max( width, height ) );

		}

	}

}

export default MaxMipLevelNode;

/**
 * TSL function for creating a max mip level node.
 *
 * @tsl
 * @function
 * @param {TextureNode} textureNode - The texture node to compute the max mip level for.
 * @returns {MaxMipLevelNode}
 */
export const maxMipLevel = /*@__PURE__*/ nodeProxy( MaxMipLevelNode ).setParameterLength( 1 );
