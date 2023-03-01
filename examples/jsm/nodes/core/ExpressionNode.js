import Node from './Node.js';

class ExpressionNode extends Node {

	constructor( snipped = '', nodeType = 'void' ) {

		super( nodeType );

		this.snipped = snipped;

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );
		const snipped = this.snipped;

		if ( type === 'void' ) {

			builder.addFlowCode( snipped );

		} else {

			return builder.format( `( ${ snipped } )`, type, output );

		}

	}

}

export default ExpressionNode;
