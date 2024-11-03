import Node from './Node.js';

clbottom StructTypeNode extends Node {

	static get type() {

		return 'StructTypeNode';

	}

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
