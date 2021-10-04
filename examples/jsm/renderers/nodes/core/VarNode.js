import Node from './Node.js';

class VarNode extends Node {

	constructor( value, name = '', nodeType = null ) {

		super( nodeType );

		this.value = value;
		this.name = name;

	}

	getNodeType( builder ) {

		return super.getNodeType( builder ) || this.value.getNodeType( builder );

	}

	generate( builder ) {

		const type = builder.getVectorType( this.getNodeType( builder ) );
		const name = this.name;
		const value = this.value;

		const nodeVar = builder.getVarFromNode( this, type );

		const snippet = value.build( builder, type );

		if ( name !== '' ) {

			nodeVar.name = name;

		}

		const propertyName = builder.getPropertyName( nodeVar );

		builder.addFlowCode( `${propertyName} = ${snippet}` );

		return propertyName;

	}

}

export default VarNode;
