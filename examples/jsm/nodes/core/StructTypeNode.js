import Node, { addNodeClass } from './Node.js';

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

addNodeClass( StructTypeNode );
