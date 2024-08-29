import Node, { registerNode } from './Node.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

class ContextNode extends Node {

	constructor( node, value = {} ) {

		super();

		this.isContextNode = true;

		this.node = node;
		this.value = value;

	}

	getScope() {

		return this.node.getScope();

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	analyze( builder ) {

		this.node.build( builder );

	}

	setup( builder ) {

		const previousContext = builder.getContext();

		builder.setContext( { ...builder.context, ...this.value } );

		const node = this.node.build( builder );

		builder.setContext( previousContext );

		return node;

	}

	generate( builder, output ) {

		const previousContext = builder.getContext();

		builder.setContext( { ...builder.context, ...this.value } );

		const snippet = this.node.build( builder, output );

		builder.setContext( previousContext );

		return snippet;

	}

}

export default ContextNode;

ContextNode.type = /*@__PURE__*/ registerNode( 'Context', ContextNode );

export const context = /*@__PURE__*/ nodeProxy( ContextNode );
export const label = ( node, name ) => context( node, { label: name } );

addMethodChaining( 'context', context );
addMethodChaining( 'label', label );
