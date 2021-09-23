import Node from './Node.js';

class PropertyNode extends Node {

	constructor( name, nodeType ) {

		super( nodeType );

		this.name = name;

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );

		const nodeVary = builder.getVarFromNode( this, type );
		nodeVary.name = this.name;

		const propertyName = builder.getPropertyName( nodeVary );

		return builder.format( propertyName, type, output );

	}

}

export default PropertyNode;
