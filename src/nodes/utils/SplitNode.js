import Node, { addNodeClass } from '../core/Node.js';
import { vectorComponents } from '../core/constants.js';

const stringVectorComponents = vectorComponents.join( '' );

class SplitNode extends Node {

	constructor( node, components = 'x' ) {

		super();

		this.node = node;
		this.components = components;

		this.isSplitNode = true;

	}

	getVectorLength() {

		let vectorLength = this.components.length;

		for ( const c of this.components ) {

			vectorLength = Math.max( vectorComponents.indexOf( c ) + 1, vectorLength );

		}

		return vectorLength;

	}

	getComponentType( builder ) {

		return builder.getComponentType( this.node.getNodeType( builder ) );

	}

	getNodeType( builder ) {

		return builder.getTypeFromLength( this.components.length, this.getComponentType( builder ) );

	}

	generate( builder, output ) {

		const node = this.node;
		const nodeTypeLength = builder.getTypeLength( node.getNodeType( builder ) );

		let snippet = null;

		if ( nodeTypeLength > 1 ) {

			let type = null;

			const componentsLength = this.getVectorLength();

			if ( componentsLength >= nodeTypeLength ) {

				// needed expand the input node

				type = builder.getTypeFromLength( this.getVectorLength(), this.getComponentType( builder ) );

			}

			const nodeSnippet = node.build( builder, type );

			if ( this.components.length === nodeTypeLength && this.components === stringVectorComponents.slice( 0, this.components.length ) ) {

				// unnecessary swizzle

				snippet = builder.format( nodeSnippet, type, output );

			} else {

				snippet = builder.format( `${nodeSnippet}.${this.components}`, this.getNodeType( builder ), output );

			}

		} else {

			// ignore .components if .node returns float/integer

			snippet = node.build( builder, output );

		}

		return snippet;

	}

	serialize( data ) {

		super.serialize( data );

		data.components = this.components;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.components = data.components;

	}

}

export default SplitNode;

addNodeClass( 'SplitNode', SplitNode );
