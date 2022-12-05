import FogNode from './FogNode.js';
import { sub, exp, mul, negate, positionView } from '../shadernode/ShaderNodeBaseElements.js';

class FogExp2Node extends FogNode {

	constructor( colorNode, densityNode ) {

		super( colorNode );

		this.isFogExp2Node = true;

		this.densityNode = densityNode;

	}

	construct() {

		const depthNode = negate( positionView.z );
		const densityNode = this.densityNode;

		this.factorNode = sub( 1.0, exp( mul( negate( densityNode ), densityNode, depthNode, depthNode ) ) );

	}

}

export default FogExp2Node;
