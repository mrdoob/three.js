import { addNodeClass } from '../core/Node.js';
import TempNode from '../core/TempNode.js';

class AssignNode extends TempNode {

	constructor( aNode, bNode ) {

		super();

		this.aNode = aNode;
		this.bNode = bNode;

	}

	hasDependencies( builder ) {

		return false;

	}

	getNodeType( builder, output ) {

		const aNode = this.aNode;
		const bNode = this.bNode;

		const typeA = aNode.getNodeType( builder );
		const typeB = bNode.getNodeType( builder );

		return typeB === 'void' ? 'void' : typeA;

	}

	generate( builder, output ) {

		const op = this.op;

		const aNode = this.aNode;
		const bNode = this.bNode;

		const type = this.getNodeType( builder, output );

		const a = aNode.build( builder, type );
		const b = bNode.build( builder, type );

		const outputLength = builder.getTypeLength( output );

		if ( output !== 'void' ) {

			builder.addLineFlowCode( `${a} = ${b}` );
			return a;

		} else if ( type !== 'void' ) {

			return builder.format( `${a} = ${b}`, type, output );

		}

	}

}

export default AssignNode;

addNodeClass( AssignNode );
