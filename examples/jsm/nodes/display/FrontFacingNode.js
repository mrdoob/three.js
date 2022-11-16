import Node from '../core/Node.js';

class FrontFacingNode extends Node {

	constructor() {

		super( 'bool' );

		this.isFrontFacingNode = true;

	}

	generate( builder ) {

		return builder.getFrontFacing();

	}

}

export default FrontFacingNode;
