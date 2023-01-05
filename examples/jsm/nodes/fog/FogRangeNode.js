import FogNode from './FogNode.js';
import { smoothstep, negate, positionView } from '../shadernode/ShaderNodeBaseElements.js';

class FogRangeNode extends FogNode {

	constructor( colorNode, nearNode, farNode ) {

		super( colorNode );

		this.isFogRangeNode = true;

		this.nearNode = nearNode;
		this.farNode = farNode;

	}

	construct() {

		this.factorNode = smoothstep( this.nearNode, this.farNode, negate( positionView.z ) );

	}

}

export default FogRangeNode;
