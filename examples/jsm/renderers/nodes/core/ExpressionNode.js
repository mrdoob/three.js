import TempNode from './TempNode.js';

class ExpressionNode extends TempNode {

	constructor( snipped = '', nodeType = 'void' ) {

		super( nodeType );

		this.snipped = snipped;

	}

	generate( builder ) {

		const type = this.getNodeType( builder );
		const snipped = this.snipped;

		if ( type === 'void' ) {

			builder.addFlowCode( snipped );

		} else {

			return `( ${ snipped } )`;

		}

	}

}

export default ExpressionNode;
