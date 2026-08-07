import { select } from '../math/ConditionalNode.js';
import { expression } from '../code/ExpressionNode.js';
import Node from '../core/Node.js';
import { addMethodChaining, nodeObject } from '../tsl/TSLCore.js';

/**
 * Represents a `discard` shader operation in TSL.
 *
 * @tsl
 * @function
 * @param {?ConditionalNode} conditional - An optional conditional node. It allows to decide whether the discard should be executed or not.
 * @return {Node} The `discard` expression.
 */
export const Discard = ( conditional ) => ( conditional ? select( conditional, expression( 'discard' ) ) : expression( 'discard' ) ).toStack();

/**
 * A node that emits a `return` statement with an optional value.
 *
 * @augments Node
 */
class ReturnNode extends Node {

	static get type() {

		return 'ReturnNode';

	}

	/**
	 * Constructs a new return node.
	 *
	 * @param {Node} valueNode - The value to return.
	 */
	constructor( valueNode ) {

		super( 'void' );

		/**
		 * The value node to return.
		 *
		 * @type {Node}
		 */
		this.valueNode = valueNode;

	}

	generate( builder ) {

		const type = this.valueNode.getNodeType( builder );
		const snippet = this.valueNode.build( builder, type );

		builder.addLineFlowCode( `return ${ snippet }`, this );

	}

}

/**
 * Represents a `return` shader operation in TSL.
 * Optionally accepts a value node to emit `return <value>`.
 *
 * @tsl
 * @function
 * @param {?Node} [value=null] - An optional value to return.
 * @return {Node} The `return` expression.
 */
export const Return = ( value = null ) => {

	const node = value !== null ? new ReturnNode( nodeObject( value ) ) : expression( 'return' );

	return node.toStack();

};

addMethodChaining( 'discard', Discard );
