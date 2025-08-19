import TempNode from './TempNode.js';
import { addMethodChaining, nodeObject } from '../tsl/TSLCore.js';

/**
 * ArrayNode represents a collection of nodes, typically created using the {@link array} function.
 * ```js
 * const colors = array( [
 * 	vec3( 1, 0, 0 ),
 * 	vec3( 0, 1, 0 ),
 * 	vec3( 0, 0, 1 )
 * ] );
 *
 * const redColor = tintColors.element( 0 );
 *
 * @augments TempNode
 */
class ArrayNode extends TempNode {

	static get type() {

		return 'ArrayNode';

	}

	/**
	 * Constructs a new array node.
	 *
	 * @param {?string} nodeType - The data type of the elements.
	 * @param {number} count - Size of the array.
	 * @param {?Array<Node>} [values=null] - Array default values.
	 */
	constructor( nodeType, count, values = null ) {

		super( nodeType );

		/**
		 * Array size.
		 *
		 * @type {number}
		 */
		this.count = count;

		/**
		 * Array default values.
		 *
		 * @type {?Array<Node>}
		 */
		this.values = values;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isArrayNode = true;

	}

	/**
	 * Returns the number of elements in the node array.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {number} The number of elements in the node array.
	 */
	getArrayCount( /*builder*/ ) {

		return this.count;

	}

	/**
	 * Returns the node's type.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The type of the node.
	 */
	getNodeType( builder ) {

		if ( this.nodeType === null ) {

			this.nodeType = this.values[ 0 ].getNodeType( builder );

		}

		return this.nodeType;

	}

	/**
	 * Returns the node's type.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The type of the node.
	 */
	getElementType( builder ) {

		return this.getNodeType( builder );

	}

	/**
	 * This method builds the output node and returns the resulting array as a shader string.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The generated shader string.
	 */
	generate( builder ) {

		const type = this.getNodeType( builder );

		return builder.generateArray( type, this.count, this.values );

	}

}

export default ArrayNode;

/**
 * TSL function for creating an array node.
 *
 * @tsl
 * @function
 * @param {string|Array<Node>} nodeTypeOrValues - A string representing the element type (e.g., 'vec3')
 * or an array containing the default values (e.g., [ vec3() ]).
 * @param {?number} [count] - Size of the array.
 * @returns {ArrayNode}
 */
export const array = ( ...params ) => {

	let node;

	if ( params.length === 1 ) {

		const values = params[ 0 ];

		node = new ArrayNode( null, values.length, values );

	} else {

		const nodeType = params[ 0 ];
		const count = params[ 1 ];

		node = new ArrayNode( nodeType, count );

	}

	return nodeObject( node );

};

addMethodChaining( 'toArray', ( node, count ) => array( Array( count ).fill( node ) ) );
