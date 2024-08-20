import ConditionalNode from '../math/ConditionalNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

let discardExpression;

class DiscardNode extends ConditionalNode {

	constructor( condNode ) {

		discardExpression = discardExpression || expression( 'discard' );

		super( condNode, discardExpression );

	}

}

export default DiscardNode;

export const inlineDiscard = nodeProxy( DiscardNode );
export const discard = ( condNode ) => inlineDiscard( condNode ).append();
export const Return = () => expression( 'return' ).append();

addMethodChaining( 'discard', discard ); // @TODO: Check... this cause a little confusing using in chaining
