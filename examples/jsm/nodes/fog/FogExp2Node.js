import FogNode from './FogNode.js';
import { positionView } from '../accessors/PositionNode.js';
import { addNode, nodeProxy } from '../shadernode/ShaderNode.js';

class FogExp2Node extends FogNode {

	constructor( colorNode, densityNode ) {

		super( colorNode );

		this.isFogExp2Node = true;

		this.densityNode = densityNode;

	}

	construct() {

		const depthNode = positionView.z.negate();
		const densityNode = this.densityNode;

		this.factorNode = densityNode.mul( densityNode, depthNode, depthNode ).negate().exp().invert();

	}

}

export default FogExp2Node;

export const densityFog = nodeProxy( FogExp2Node );

addNode( 'densityFog', densityFog );
