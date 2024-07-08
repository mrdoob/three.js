import { addNodeClass } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { vectorComponents } from '../core/constants.js';

class SetNode extends TempNode {

	constructor( sourceNode, components, targetNode ) {

		super();

		this.sourceNode = sourceNode;
		this.components = components;
		this.targetNode = targetNode;

	}

	getNodeType( builder ) {

		return this.sourceNode.getNodeType( builder );

	}

	generate( builder ) {

		const { sourceNode, components, targetNode } = this;

		const sourceType = this.getNodeType( builder );
		const targetType = builder.getTypeFromLength( components.length );

		const targetSnippet = targetNode.build( builder, targetType );
		const sourceSnippet = sourceNode.build( builder, sourceType );

		const length = builder.getTypeLength( sourceType );
		const snippetValues = [];

		for ( let i = 0; i < length; i ++ ) {

			const component = vectorComponents[ i ];

			if ( component === components[ 0 ] ) {

				snippetValues.push( targetSnippet );

				i += components.length - 1;

			} else {

				snippetValues.push( sourceSnippet + '.' + component );

			}

		}

		return `${ builder.getType( sourceType ) }( ${ snippetValues.join( ', ' ) } )`;

	}

}

export default SetNode;

addNodeClass( 'SetNode', SetNode );
