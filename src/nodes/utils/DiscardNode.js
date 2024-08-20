import { select } from '../math/CondNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addMethodChaining } from '../tsl/TSLCore.js';

export const Discard = ( conditional ) => conditional ? select( conditional, expression( 'discard' ).append() ) : expression( 'discard' ).append();
export const Return = () => expression( 'return' ).append();

addMethodChaining( 'discard', Discard );
