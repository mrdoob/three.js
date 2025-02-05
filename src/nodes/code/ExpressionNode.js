import Node from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLCore.js';

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
	 * @param {string} [snippet=''] - The native code snippet.
	 * @param {string} [nodeType='void'] - The node type.
	 */
	constructor( snippet = '', nodeType = 'void' ) {

		super( nodeType );

		/**
		 * The native code snippet.
		 *
		 * @type {string}
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
 * @tsl
 * @function
 * @param {string} [snippet=''] - The native code snippet.
 * @param {string} [nodeType='void'] - The node type.
 * @returns {ExpressionNode}
 */
export const expression = /*@__PURE__*/ nodeProxy( ExpressionNode );
