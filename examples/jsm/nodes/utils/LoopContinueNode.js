import CondNode from '../math/CondNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

let continueExpression;

class LoopContinueNode extends CondNode {

	constructor( condNode ) {

		continueExpression = continueExpression || expression( 'continue' );

		super( condNode, continueExpression );

	}

}

export default LoopContinueNode;

export const inlineContinue = nodeProxy( LoopContinueNode );
export const Continue = ( condNode ) => inlineContinue( condNode ).append();

addNodeElement( 'continue', Continue ); // @TODO: Check... this cause a little confusing using in chaining

addNodeClass( 'LoopContinueNode', LoopContinueNode );
