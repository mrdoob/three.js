import CondNode from '../math/CondNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy, getCurrentStack } from '../shadernode/ShaderNode.js';

let discardExpression;

class DiscardNode extends CondNode {

	constructor( condNode ) {

		discardExpression = discardExpression || expression( 'discard' );

		super( condNode, discardExpression );

	}

}

export default DiscardNode;

export const inlineDiscard = nodeProxy( DiscardNode );
export const discard = ( condNode ) => getCurrentStack().add( inlineDiscard( condNode ) );

addNodeElement( 'discard', discard ); // @TODO: Check... this cause a little confusing using in chaining

addNodeClass( 'DiscardNode', DiscardNode );
