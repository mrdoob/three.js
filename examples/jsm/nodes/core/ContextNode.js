import TempNode from './TempNode.js';
import { addNodeClass } from './Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class ContextNode extends TempNode {

	constructor( node, context = {}, isolate = true ) {

		super();

		this.isContextNode = true;

		this.node = isolate === true ? node.cache() : node;
		this._context = context;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	setup( builder ) {

		const previousContext = builder.getContext();

		builder.setContext( { ...builder.context, ...this._context } );

		super.setup( builder );

		const node = this.node.build( builder );

		builder.setContext( previousContext );

		return node;

	}

	generate( builder, output ) {

		const previousContext = builder.getContext();

		builder.setContext( { ...builder.context, ...this._context } );

		const snippet = this.node.build( builder, output );

		builder.setContext( previousContext );

		return snippet;

	}

}

export default ContextNode;

export const context = nodeProxy( ContextNode );
export const label = ( node, name ) => context( node, { label: name }, false );

addNodeElement( 'context', context );
addNodeElement( 'label', label );

addNodeClass( 'ContextNode', ContextNode );
