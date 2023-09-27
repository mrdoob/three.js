import UniformNode from './UniformNode.js';
import { addNodeClass } from './Node.js';

class ArrayUniformNode extends UniformNode {

	constructor( nodes = [] ) {

		super();

		this.isArrayUniformNode = true;

		this.nodes = nodes;

	}

	getNodeType( builder ) {

		return this.nodes[ 0 ].getNodeType( builder );

	}

}

export default ArrayUniformNode;

addNodeClass( 'ArrayUniformNode', ArrayUniformNode );
