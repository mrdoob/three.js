import FogNode from './FogNode.js';
import { smoothstep, negate, positionView } from '../shadernode/ShaderNodeElements.js';

class FogRangeNode extends FogNode {

	constructor( colorNode, nearNode, farNode ) {

		super( colorNode );

		this.nearNode = nearNode;
		this.farNode = farNode;

	}

	generate( builder ) {

		this.factorNode = smoothstep( this.nearNode, this.farNode, negate( positionView.z ) );

		return super.generate( builder );

	}

}

FogRangeNode.prototype.isFogRangeNode = true;

export default FogRangeNode;
