/**
 * @author sunag / http://www.sunag.com.br/
 */

import { FunctionNode } from './FunctionNode.js';

export class ExpressionNode extends FunctionNode {

	constructor( src, type, keywords, extensions, includes ) {

		super( src, includes, extensions, keywords, type );

		this.nodeType = "Expression";

	}

	fromParser( parser, prop ) {

		this.tokenProperties = prop.nodes;

		return this;

	}

}
