import Node from './Node.js';

class ExpressionNode extends Node {

	constructor( snipped = '', type = null ) {

		super( type );

		this.snipped = snipped;

	}

	generate( builder, output ) {

		const type = this.getType( builder );
		const snipped = this.snipped;

		return builder.format( `( ${ snipped } )`, type, output );

	}

}

export default ExpressionNode;
