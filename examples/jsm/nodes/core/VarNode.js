import Node from './Node.js';
import OperatorNode from '../math/OperatorNode.js';

class VarNode extends Node {

	constructor( node, name = null ) {

		super();

		this.node = node;
		this.name = name;

	}

	op( op, ...params ) {

		this.node = new OperatorNode( op, this.node, ...params );

		return this;

	}

	assign( ...params ) {

		return this.op( '=', ...params );

	}

	add( ...params ) {

		return this.op( '+', ...params );

	}

	sub( ...params ) {

		return this.op( '-', ...params );

	}

	mul( ...params ) {

		return this.op( '*', ...params );

	}

	div( ...params ) {

		return this.op( '/', ...params );

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

export default VarNode;
