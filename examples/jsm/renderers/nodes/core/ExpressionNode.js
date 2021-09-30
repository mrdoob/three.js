import TempNode from './TempNode.js';

class ExpressionNode extends TempNode {

	constructor( snipped = '', nodeType = null ) {

		super( nodeType );

		this.snipped = snipped;

	}

	generate( builder ) {

		return `( ${ this.snipped } )`;

	}

}

export default ExpressionNode;
