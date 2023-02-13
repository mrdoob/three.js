import CondNode from '../math/CondNode.js';
import { expression } from '../core/ExpressionNode.js';
import { addNode, nodeProxy } from '../shadernode/ShaderNode.js';

let discardExpression;

class DiscardNode extends CondNode {

	constructor( condNode ) {

		discardExpression = discardExpression || expression( 'discard' );

		super( condNode, discardExpression );

	}

}

export default DiscardNode;

export const discard = nodeProxy( DiscardNode );

addNode( 'discard', discard );
