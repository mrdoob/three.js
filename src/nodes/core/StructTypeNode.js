import Node, { registerNodeClass } from './Node.js';

class StructTypeNode extends Node {

	constructor( types ) {

		super();

		this.types = types;
		this.isStructTypeNode = true;

	}

	getMemberTypes() {

		return this.types;

	}

}

export default StructTypeNode;

registerNodeClass( 'StructType', StructTypeNode );
