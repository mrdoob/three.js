import Node from './Node.js';

class VarNode extends Node {

	constructor( value, name = '', type = null ) {

		super( type );

		this.value = value;
		this.name = name;

	}

	getType( builder ) {

		return this.type || this.value.getType( builder );

	}

	generate( builder, output ) {

		const type = builder.getVectorType( this.type || this.getType( builder ) );
		const name = this.name;
		const value = this.value;

		const nodeVar = builder.getVarFromNode( this, type );

		const snippet = value.build( builder, type );

		if ( name !== '' ) {

			nodeVar.name = name;

		}

		const propertyName = builder.getPropertyName( nodeVar );

		builder.addFlowCode( `${propertyName} = ${snippet}` );

		return builder.format( propertyName, type, output );

	}

}

export default VarNode;
