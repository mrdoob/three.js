import FogNode from './FogNode.js';
import { smoothstep } from '../math/MathNode.js';
import { positionView } from '../accessors/PositionNode.js';
import { addNode, nodeProxy } from '../shadernode/ShaderNode.js';

class FogRangeNode extends FogNode {

	constructor( colorNode, nearNode, farNode ) {

		super( colorNode );

		this.isFogRangeNode = true;

		this.nearNode = nearNode;
		this.farNode = farNode;

	}

	construct() {

		this.factorNode = smoothstep( this.nearNode, this.farNode, positionView.z.negate() );

	}

}

export default FogRangeNode;

export const rangeFog = nodeProxy( FogRangeNode );

addNode( 'rangeFog', rangeFog );
