import UniformNode from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';

class MaxMipLevelNode extends UniformNode {

	constructor( textureNode ) {

		super( 0 );

		this.textureNode = textureNode;

		this.updateType = NodeUpdateType.FRAME;

	}

	get texture() {

		return this.textureNode.value;

	}

	update() {

		const texture = this.texture;
		const images = texture.images;
		const image = ( images && images.length > 0 ) ? ( images[ 0 ]?.image || images[ 0 ] ) : texture.image;

		if ( image?.width !== undefined ) {

			const { width, height } = image;

			this.value = Math.log2( Math.max( width, height ) );

		}

	}

}

export default MaxMipLevelNode;
