import Node from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLBase.js';

/** @module BuiltinNode **/

/**
 * The node allows to set values for built-in shader variables. That is
 * required for features like hardware-accelerated vertex clipping.
 *
 * @augments Node
 */
class BuiltinNode extends Node {

	/**
	 * Constructs a new builtin node.
	 *
	 * @param {String} name - The name of the built-in shader variable.
	 */
	constructor( name ) {

		super( 'float' );

		/**
		 * The name of the built-in shader variable.
		 *
		 * @type {String}
		 */
		this.name = name;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isBuiltinNode = true;

	}

	/**
	 * Generates the code snippet of the builtin node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The generated code snippet.
	 */
	generate( /* builder */ ) {

		return this.name;

	}

}

export default BuiltinNode;

/**
 * TSL function for creating a builtin node.
 *
 * @function
 * @param {String} name - The name of the built-in shader variable.
 * @returns {BuiltinNode}
 */
export const builtin = nodeProxy( BuiltinNode );
