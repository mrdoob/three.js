import TempNode from '../core/TempNode.js';
import { vectorComponents } from '../core/constants.js';

/**
 * This module is part of the TSL core and usually not used in app level code.
 * `SetNode` represents a set operation which means it is used to implement any
 * `setXYZW()`, `setRGBA()` and `setSTPQ()` method invocations on node objects.
 * For example:
 * ```js
 * materialLine.colorNode = color( 0, 0, 0 ).setR( float( 1 ) );
 * ```
 *
 * @augments TempNode
 */
class SetNode extends TempNode {

	static get type() {

		return 'SetNode';

	}

	/**
	 * Constructs a new set node.
	 *
	 * @param {Node} sourceNode - The node that should be updated.
	 * @param {String} components - The components that should be updated.
	 * @param {Node} targetNode - The value node.
	 */
	constructor( sourceNode, components, targetNode ) {

		super();

		/**
		 * The node that should be updated.
		 *
		 * @type {Node}
		 */
		this.sourceNode = sourceNode;

		/**
		 * The components that should be updated.
		 *
		 * @type {String}
		 */
		this.components = components;

		/**
		 * The value node.
		 *
		 * @type {Node}
		 */
		this.targetNode = targetNode;

	}

	/**
	 * This method is overwritten since the node type is inferred from {@link SetNode#sourceNode}.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The node type.
	 */
	getNodeType( builder ) {

		return this.sourceNode.getNodeType( builder );

	}

	generate( builder ) {

		const { sourceNode, components, targetNode } = this;

		const sourceType = this.getNodeType( builder );

		const componentType = builder.getComponentType( targetNode.getNodeType( builder ) );
		const targetType = builder.getTypeFromLength( components.length, componentType );

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
