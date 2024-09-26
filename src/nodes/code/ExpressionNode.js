import Node from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLCore.js';

class ExpressionNode extends Node {

	static get type() {

		return 'ExpressionNode';

	}

	constructor( snippet = '', nodeType = 'void' ) {

		super( nodeType );

		this.snippet = snippet;

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );
		const snippet = this.snippet;

		if ( type === 'void' ) {

			builder.addLineFlowCode( snippet, this );

		} else {

			return builder.format( `( ${ snippet } )`, type, output );

		}

	}

}

export default ExpressionNode;

export const expression = /*@__PURE__*/ nodeProxy( ExpressionNode );
