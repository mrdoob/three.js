import UniformNode from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';

class MaxMipLevelNode extends UniformNode {

	constructor( texture ) {

		super( 0 );

		this.texture = texture;

		this.updateType = NodeUpdateType.Frame;

	}

	update() {

		const { width, height } = this.texture.images ? this.texture.images[ 0 ] : this.texture.image;

		this.value = Math.log( Math.max( width, height ) ) * Math.LOG2E;

		if ( this.value > 0 ) {

			this.updateType = NodeUpdateType.None;

		}

	}

}

export default MaxMipLevelNode;
