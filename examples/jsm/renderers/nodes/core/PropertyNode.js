import Node from './Node.js';

class PropertyNode extends Node {

	constructor( name, nodeType ) {

		super( nodeType );

		this.name = name;

	}

	generate( builder ) {

		const nodeVary = builder.getVarFromNode( this, this.getNodeType( builder ) );
		nodeVary.name = this.name;

		return builder.getPropertyName( nodeVary );

	}

}

export default PropertyNode;
