import Node from './Node.js';

class VaryNode extends Node {

	constructor( value ) {

		super();

		this.value = value;

	}

	getType( builder ) {
		
		// VaryNode is auto type
		
		return this.value.getType( builder );
		
	}

	generate( builder, output ) {

		const type = this.getType( builder );

		const value = this.value.build( builder, type );

		const nodeVary = builder.getVaryFromNode( this, type, value );
		const propertyName = builder.getPropertyName( nodeVary );

		return builder.format( propertyName, type, output );

	}

}

export default VaryNode;
