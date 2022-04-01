import Node from './Node.js';

class VarNode extends Node {

	constructor( node, name = null ) {

		super();

		this.node = node;
		this.name = name;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	generate( builder ) {

		const node = this.node;

		if ( node.isTempNode === true ) {

			return node.build( builder );

		}

		const name = this.name;
		const type = builder.getVectorType( this.getNodeType( builder ) );

		const snippet = node.build( builder, type );
		const nodeVar = builder.getVarFromNode( this, type );

		if ( name !== null ) {

			nodeVar.name = name;

		}

		const propertyName = builder.getPropertyName( nodeVar );

		builder.addFlowCode( `${propertyName} = ${snippet}` );

		return propertyName;

	}

}

VarNode.prototype.isVarNode = true;

export default VarNode;
