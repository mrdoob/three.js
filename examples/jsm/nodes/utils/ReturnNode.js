import CondNode from '../math/CondNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

let breakExpression;

class ReturnNode extends CondNode {

	constructor( condNode ) {

		breakExpression = breakExpression || expression( 'return' );

		super( condNode, breakExpression );

	}

}

export default ReturnNode;

export const inlineBreak = nodeProxy( ReturnNode );
export const Return = ( condNode ) => inlineBreak( condNode ).append();

addNodeElement( 'return', Return ); // @TODO: Check... this cause a little confusing using in chaining

addNodeClass( 'ReturnNode', ReturnNode );
