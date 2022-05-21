import UniformNode from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';

class MaxMipLevelNode extends UniformNode {

	constructor( texture ) {

		super( 0 );

		this.texture = texture;

		this.updateType = NodeUpdateType.Frame;

	}

	update() {

		const image = this.texture.images ? this.texture.images[ 0 ].image || this.texture.images[ 0 ] : this.texture.image;

		if ( image?.width !== undefined ) {

			const { width, height } = image;

			this.value = Math.log2( Math.max( width, height ) );

		}

	}

}

export default MaxMipLevelNode;
