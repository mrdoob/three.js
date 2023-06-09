import FogNode from './FogNode.js';
import { positionView } from '../accessors/PositionNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class FogExp2Node extends FogNode {

	constructor( colorNode, densityNode ) {

		super( colorNode );

		this.isFogExp2Node = true;

		this.densityNode = densityNode;

	}

	construct() {

		const depthNode = positionView.z.negate();
		const densityNode = this.densityNode;

		return densityNode.mul( densityNode, depthNode, depthNode ).negate().exp().oneMinus();

	}

}

export default FogExp2Node;

export const densityFog = nodeProxy( FogExp2Node );

addNodeElement( 'densityFog', densityFog );

addNodeClass( FogExp2Node );
