import { select } from '../math/ConditionalNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addMethodChaining } from '../tsl/TSLCore.js';

export const Discard = ( conditional ) => ( conditional ? select( conditional, expression( 'discard' ) ) : expression( 'discard' ) ).append();
export const Return = () => expression( 'return' ).append();

addMethodChaining( 'discard', Discard );
