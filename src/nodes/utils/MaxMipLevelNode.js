import UniformNode from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { addNodeClass } from '../core/Node.js';

class MaxMipLevelNode extends UniformNode {

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

export const maxMipLevel = nodeProxy( MaxMipLevelNode );

addNodeClass( 'MaxMipLevelNode', MaxMipLevelNode );
