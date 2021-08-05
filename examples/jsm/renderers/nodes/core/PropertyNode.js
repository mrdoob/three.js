import Node from './Node.js';

class PropertyNode extends Node {

	constructor( name, type ) {

		super();

		this.name = name;
		this.type = type;

	}

	generate( builder, output ) {

		const type = this.getType( builder );

		const nodeVary = builder.getVarFromNode( this, type );
		nodeVary.name = this.name;

		const propertyName = builder.getPropertyName( nodeVary );

		return builder.format( propertyName, type, output );

	}

}

export default PropertyNode;
