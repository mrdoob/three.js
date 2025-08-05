import TempNode from '../core/TempNode.js';
import { vectorComponents } from '../core/constants.js';

/**
 * This module is part of the TSL core and usually not used in app level code.
 * It represents a flip operation during the shader generation process
 * meaning it flips normalized values with the following formula:
 * ```
 * x = 1 - x;
 * ```
 * `FlipNode` is internally used to implement any `flipXYZW()`, `flipRGBA()` and
 * `flipSTPQ()` method invocations on node objects. For example:
 * ```js
 * uvNode = uvNode.flipY();
 * ```
 *
 * @augments TempNode
 */
class FlipNode extends TempNode {

	static get type() {

		return 'FlipNode';

	}

	/**
	 * Constructs a new flip node.
	 *
	 * @param {Node} sourceNode - The node which component(s) should be flipped.
	 * @param {string} components - The components that should be flipped e.g. `'x'` or `'xy'`.
	 */
	constructor( sourceNode, components ) {

		super();

		/**
		 * The node which component(s) should be flipped.
		 *
		 * @type {Node}
		 */
		this.sourceNode = sourceNode;

		/**
		 * The components that should be flipped e.g. `'x'` or `'xy'`.
		 *
		 * @type {string}
		 */
		this.components = components;

	}

	/**
	 * This method is overwritten since the node type is inferred from the source node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
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
