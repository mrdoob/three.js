import Node from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLCore.js';

/** @module ExpressionNode **/

/**
 * This class can be used to implement basic expressions in shader code.
 * Basic examples for that are `return`, `continue` or `discard` statements.
 *
 * @augments Node
 */
class ExpressionNode extends Node {

	static get type() {

		return 'ExpressionNode';

	}

	/**
	 * Constructs a new expression node.
	 *
	 * @param {String} [snippet=''] - The native code snippet.
	 * @param {String} [nodeType='void'] - The node type.
	 */
	constructor( snippet = '', nodeType = 'void' ) {

		super( nodeType );

		/**
		 * The native code snippet.
		 *
		 * @type {String}
		 * @default ''
		 */
		this.snippet = snippet;

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );
		const snippet = this.snippet;

		if ( type === 'void' ) {

			builder.addLineFlowCode( snippet, this );

		} else {

			return builder.format( `( ${ snippet } )`, type, output );

		}

	}

}

export default ExpressionNode;

/**
 * TSL function for creating an expression node.
 *
 * @function
 * @param {String} [snippet=''] - The native code snippet.
 * @param {String} [nodeType='void'] - The node type.
 * @returns {ExpressionNode}
 */
export const expression = /*@__PURE__*/ nodeProxy( ExpressionNode );
