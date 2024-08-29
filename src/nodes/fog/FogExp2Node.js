import { registerNode } from '../core/Node.js';
import FogNode from './FogNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';

class FogExp2Node extends FogNode {

	constructor( colorNode, densityNode ) {

		super( colorNode );

		this.isFogExp2Node = true;

		this.densityNode = densityNode;

	}

	setup( builder ) {

		const viewZ = this.getViewZNode( builder );
		const density = this.densityNode;

		return density.mul( density, viewZ, viewZ ).negate().exp().oneMinus();

	}

}

export default FogExp2Node;

FogExp2Node.type = /*@__PURE__*/ registerNode( 'FogExp2', FogExp2Node );

export const densityFog = /*@__PURE__*/ nodeProxy( FogExp2Node );
