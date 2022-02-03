import Node from '../core/Node.js';
import { vector } from '../core/NodeBuilder.js';

class SplitNode extends Node {

	constructor( node, components = 'x' ) {

		super();

		this.node = node;
		this.components = components;

	}

	getVectorLength() {

		let vectorLength = this.components.length;

		for ( const c of this.components ) {

			vectorLength = Math.max( vector.indexOf( c ) + 1, vectorLength );

		}

		return vectorLength;

	}

	getNodeType( builder ) {

		return builder.getTypeFromLength( this.components.length );

	}

	generate( builder ) {

		const node = this.node;
		const nodeTypeLength = builder.getTypeLength( node.getNodeType( builder ) );

		if ( nodeTypeLength > 1 ) {

			let type = null;

			const componentsLength = this.getVectorLength();

			if ( componentsLength >= nodeTypeLength ) {

				// need expand the input node

				type = builder.getTypeFromLength( this.getVectorLength() );

			}

			const nodeSnippet = node.build( builder, type );

			return `${nodeSnippet}.${this.components}`;

		} else {

			// ignore components if node is a float

			return node.build( builder );

		}

	}

}

export default SplitNode;
