import { select } from '../math/ConditionalNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addMethodChaining } from '../tsl/TSLCore.js';
import { returnNode } from './ReturnNode.js';

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
 * Represents a `return` shader operation in TSL.
 *
 * @tsl
 * @function
 * @param {?Node} value - Optional return value.
 * @return {ReturnNode} The `return` expression.
 */
export const Return = ( value = null ) => returnNode( value ).toStack();

addMethodChaining( 'discard', Discard );
addMethodChaining( 'return', Return );
