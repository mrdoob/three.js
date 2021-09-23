import Node from './Node.js';

class ExpressionNode extends Node {

	constructor( snipped = '', nodeType = null ) {

		super( nodeType );

		this.snipped = snipped;

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );
		const snipped = this.snipped;

		return builder.format( `( ${ snipped } )`, type, output );

	}

}

export default ExpressionNode;
