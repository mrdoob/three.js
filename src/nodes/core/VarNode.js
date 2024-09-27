import Node from './Node.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

class VarNode extends Node {

	static get type() {

		return 'VarNode';

	}

	constructor( node, name = null ) {

		super();

		this.node = node;
		this.name = name;

		this.global = true;

		this.isVarNode = true;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	generate( builder ) {

		const { node, name } = this;

		const nodeVar = builder.getVarFromNode( this, name, builder.getVectorType( this.getNodeType( builder ) ) );

		const propertyName = builder.getPropertyName( nodeVar );

		const snippet = node.build( builder, nodeVar.type );

		builder.addLineFlowCode( `${propertyName} = ${snippet}`, this );

		return propertyName;

	}

}

export default VarNode;

export const temp = /*@__PURE__*/ nodeProxy( VarNode );

addMethodChaining( 'temp', temp ); // @TODO: Will be removed in the future
addMethodChaining( 'toVar', ( ...params ) => temp( ...params ).append() );
