import Node, { addNodeClass } from 'three/examples/jsm/nodes/core/Node.js';

class StructTypeNode extends Node {

	constructor( types ) {

		super();

        this.types = types;
		this.isStructTypeNode = true;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

    getMemberTypes() {

        return this.types;

    }

}

export default StructTypeNode;

addNodeClass( StructTypeNode );
