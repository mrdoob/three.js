import { expression } from '../code/ExpressionNode.js';
import { nodeProxy } from '../tsl/TSLCore.js';
import TempNode from '../core/TempNode.js';

/**
 * `ArrayBuiltinNode` represents any builtin function that operates and/or parses array data
 * within a shader.
 *
 * This node can only be used with a WebGPU backend.
 *
 * @augments Node
 */
class ArrayBuiltinNode extends TempNode {

	static get type() {

		return 'ArrayBuiltinNode';

	}

	/**
	 * Constructs a new atomic function node.
	 *
	 * @param {string} method - The signature of the array builtin function to construct.
	 * @param {StorageBufferNode} arrayNode - The array to modify/parse.
	 */
	constructor( method, arrayNode ) {

		super( 'uint' );

		/**
		 * The signature of the array builtin function to construct.
		 *
		 * @type {string}
		 */
		this.method = method;

		/**
		 * The array to parse and/or modify.
		 *
		 * @type {Node}
		 */
		this.arrayNode = arrayNode;

	}

	/**
	 * Overwrites the default implementation to return the type of
	 * the pointer node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The input type.
	 */
	getInputType( builder ) {

		return this.arrayNode.getNodeType( builder );

	}

	/**
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
	getNodeType() {

		return 'uint';

	}

	generate( builder ) {

		const properties = builder.getNodeProperties( this );

		const method = this.method;

		const type = this.getNodeType( builder );
		const inputType = this.getInputType( builder );

		const a = this.arrayNode;

		const params = [];

		params.push( `&${ a.build( builder, inputType ) }` );

		const methodSnippet = `${ builder.getMethod( method, type ) }( ${ params.join( ', ' ) } )`;

		if ( properties.constNode === undefined ) {

			properties.constNode = expression( methodSnippet, type ).toConst();

		}

		return properties.constNode.build( builder );


	}

}

ArrayBuiltinNode.ARRAY_LENGTH = 'arrayLength';

export default ArrayBuiltinNode;

/**
 * Returns the length of the provided array
 *
 * @tsl
 * @function
 * @param {StorageBufferNode} x - The target array.
 * @returns {Node}
 */
export const arrayLength = /*@__PURE__*/ nodeProxy( ArrayBuiltinNode, ArrayBuiltinNode.ARRAY_LENGTH.ALL ).setParameterLength( 1 );

