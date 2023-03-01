import CondNode from '../math/CondNode.js';
import ExpressionNode from '../core/ExpressionNode.js';

let discardExpression;

class DiscardNode extends CondNode {

	constructor( condNode ) {

		discardExpression = discardExpression || new ExpressionNode( 'discard' );

		super( condNode, discardExpression );

	}

}

export default DiscardNode;
