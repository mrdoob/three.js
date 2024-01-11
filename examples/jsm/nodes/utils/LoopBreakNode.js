import CondNode from '../math/CondNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

let breakExpression;

class LoopBreakNode extends CondNode {

	constructor( condNode ) {

		breakExpression = breakExpression || expression( 'break' );

		super( condNode, breakExpression );

	}

}

export default LoopBreakNode;

export const inlineBreak = nodeProxy( LoopBreakNode );
export const Break = ( condNode ) => inlineBreak( condNode ).append();

addNodeElement( 'break', Break ); // @TODO: Check... this cause a little confusing using in chaining

addNodeClass( 'LoopBreakNode', LoopBreakNode );
