import Node, { addNodeClass } from '../core/Node.js';

class ArrayElementNode extends Node {

	constructor( node, indexNode ) {

		super();

		this.node = node;
		this.indexNode = indexNode;

		this.isArrayElementNode = true;

	}

	getNodeType( builder ) {

		const type = this.node.getNodeType( builder );

		const arrayType = /(.+)\[\s*(\d+?)\s*\]/.exec( type );
		if ( arrayType !== null ) return arrayType[ 1 ];

		const componentType = builder.getComponentType( type );

		if ( builder.getTypeLength( type ) > 4 ) return builder.getTypeFromLength( Math.sqrt( builder.getTypeLength( type ) ), componentType );
		else if ( builder.getTypeLength( type ) > 1 ) return componentType;

		return type;

	}

	generate( builder ) {

		const nodeSnippet = this.node.build( builder );
		const indexSnippet = this.indexNode.build( builder, 'uint' );

		return builder.formatOperation( '[]', nodeSnippet, indexSnippet );

	}

}

export default ArrayElementNode;

addNodeClass( 'ArrayElementNode', ArrayElementNode );
