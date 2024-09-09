import FogNode from './FogNode.js';
import { smoothstep } from '../math/MathNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';

class FogRangeNode extends FogNode {

	static get type() {

		return 'FogRangeNode';

	}

	constructor( colorNode, nearNode, farNode ) {

		super( colorNode );

		this.isFogRangeNode = true;

		this.nearNode = nearNode;
		this.farNode = farNode;

	}

	setup( builder ) {

		const viewZ = this.getViewZNode( builder );

		return smoothstep( this.nearNode, this.farNode, viewZ );

	}

}

export default FogRangeNode;

export const rangeFog = /*@__PURE__*/ nodeProxy( FogRangeNode );
