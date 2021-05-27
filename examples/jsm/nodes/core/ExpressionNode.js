import { FunctionNode } from './FunctionNode.js';

class ExpressionNode extends FunctionNode {

	constructor( src, type, keywords, extensions, includes ) {

		super( src, includes, extensions, keywords, type );

	}

}

ExpressionNode.prototype.nodeType = 'Expression';

export { ExpressionNode };
