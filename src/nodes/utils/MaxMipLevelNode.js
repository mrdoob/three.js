import UniformNode from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy } from '../tsl/TSLBase.js';

class MaxMipLevelNode extends UniformNode {

	static get type() {

		return 'MaxMipLevelNode';

	}

	constructor( textureNode ) {

		super( 0 );

		this._textureNode = textureNode;

		this.updateType = NodeUpdateType.FRAME;

	}

	get textureNode() {

		return this._textureNode;

	}

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

export const maxMipLevel = /*@__PURE__*/ nodeProxy( MaxMipLevelNode );
