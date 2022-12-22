import CondNode from '../math/CondNode.js';
import { ExpressionNode } from '../Nodes.js'; '../core/ExpressionNode.js';

let discardExpression;

class DiscardNode extends CondNode {

	constructor( condNode ) {

		discardExpression ||= new ExpressionNode( 'discard' );

		super( condNode, discardExpression );

	}

}

export default DiscardNode;
