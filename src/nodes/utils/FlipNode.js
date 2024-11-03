import TempNode from '../core/TempNode.js';
import { vectorComponents } from '../core/constants.js';

class FlipNode extends TempNode {

	static get type() {

		return 'FlipNode';

	}

	constructor( sourceNode, components ) {

		super();

		this.sourceNode = sourceNode;
		this.components = components;

	}

	getNodeType( builder ) {

		return this.sourceNode.getNodeType( builder );

	}

	generate( builder ) {

		const { components, sourceNode } = this;

		const sourceType = this.getNodeType( builder );
		const sourceSnippet = sourceNode.build( builder );

		const sourceCache = builder.getVarFromNode( this );
		const sourceProperty = builder.getPropertyName( sourceCache );

		builder.addLineFlowCode( sourceProperty + ' = ' + sourceSnippet, this );

		const length = builder.getTypeLength( sourceType );
		const snippetValues = [];

		let componentIndex = 0;

		for ( let i = 0; i < length; i ++ ) {

			const component = vectorComponents[ i ];

			if ( component === components[ componentIndex ] ) {

				snippetValues.push( '1.0 - ' + ( sourceProperty + '.' + component ) );

				componentIndex ++;

			} else {

				snippetValues.push( sourceProperty + '.' + component );

			}

		}

		return `${ builder.getType( sourceType ) }( ${ snippetValues.join( ', ' ) } )`;

	}

}

export default FlipNode;
