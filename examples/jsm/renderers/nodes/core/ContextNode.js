import Node from './Node.js';

class ContextNode extends Node {

	constructor( node, type, context = {} ) {

		super( type );

		this.node = node;

		this.context = context;

		Object.defineProperty( this, 'isContextNode', { value: true } );

	}

	setContextValue( name, value ) {

		this.context[ name ] = value;

		return this;

	}

	getContextValue( name ) {

		return this.context[ name ];

	}

	getType( builder ) {

		return this.node.getType( builder );

	}

	generate( builder, output ) {

		const previousContext = builder.getContext();

		builder.setContext( Object.assign( {}, builder.context, this.context ) );

		const snippet = this.node.build( builder, output );

		builder.setContext( previousContext );

		return snippet;

	}

}

export default ContextNode;
