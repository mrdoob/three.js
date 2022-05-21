import Node from '../core/Node.js';

class FrontFacingNode extends Node {

	constructor() {

		super( 'bool' );

	}

	generate( builder ) {

		return builder.getFrontFacing();

	}

}

FrontFacingNode.prototype.isFrontFacingNode = true;

export default FrontFacingNode;
