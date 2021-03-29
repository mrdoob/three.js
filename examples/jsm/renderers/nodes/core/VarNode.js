import Node from './Node.js';

class VarNode extends Node {

	constructor( value, name = '' ) {

		super();

		this.value = value;
		this.name = name;

	}

	getType( builder ) {

		return this.value.getType( builder );

	}

	generate( builder, output ) {

		const snippet = this.value.build( builder );

		const type = this.getType( builder );

		const nodeVary = builder.getVarFromNode( this, type );
		nodeVary.snippet = snippet;

		if ( this.name !== '' ) {

			nodeVary.name = this.name;

		}

		const propertyName = builder.getPropertyName( nodeVary );

		return builder.format( propertyName, type, output );

	}

}

export default VarNode;
