import Node from './Node.js';

class ContextNode extends Node {

	constructor( node, parameters = {} ) {

		super();

		this.node = node;

		this.parameters = parameters;

		Object.defineProperty( this, 'isContextNode', { value: true } );

	}

	setParameter( name, value ) {

		this.parameters[ name ] = value;

		return this;

	}

	getParameter( name ) {

		return this.parameters[ name ];

	}

	getType( builder ) {

		return this.node.getType( builder );

	}

	generate( builder, output ) {

		const previousContext = builder.getContext();

		builder.setContext( Object.assign( {}, builder.context, this.parameters ) );

		const snippet = this.node.build( builder, output );

		builder.setContext( previousContext );

		return snippet;

	}

}

export default ContextNode;
