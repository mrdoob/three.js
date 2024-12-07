import { select } from '../math/ConditionalNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addMethodChaining } from '../tsl/TSLCore.js';

/** @module Discard **/

/**
 * Represents a `discard` shader operation in TSL.
 *
 * @method
 * @param {ConditionalNode?} conditional - An optional conditional node. It allows to decide whether the discard should be executed or not.
 * @return {Node} The `discard` expression.
 */
export const Discard = ( conditional ) => ( conditional ? select( conditional, expression( 'discard' ) ) : expression( 'discard' ) ).append();

/**
 * Represents a `return` shader operation in TSL.
 *
 * @method
 * @return {ExpressionNode} The `return` expression.
 */
export const Return = () => expression( 'return' ).append();

addMethodChaining( 'discard', Discard );
