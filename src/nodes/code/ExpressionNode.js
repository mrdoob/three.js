import Node, { registerNode } from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLCore.js';

class ExpressionNode extends Node {

	constructor( snippet = '', nodeType = 'void' ) {

		super( nodeType );

		this.snippet = snippet;

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );
		const snippet = this.snippet;

		if ( type === 'void' ) {

			builder.addLineFlowCode( snippet );

		} else {

			return builder.format( `( ${ snippet } )`, type, output );

		}

	}

}

export default ExpressionNode;

ExpressionNode.type = /*@__PURE__*/ registerNode( 'Expression', ExpressionNode );

export const expression = /*@__PURE__*/ nodeProxy( ExpressionNode );
