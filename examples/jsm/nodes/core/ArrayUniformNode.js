import UniformNode from './UniformNode.js';

class ArrayUniformNode extends UniformNode {

	constructor( nodes = [] ) {

		super();

		this.nodes = nodes;

	}

	getNodeType( builder ) {

		return this.nodes[ 0 ].getNodeType( builder );

	}

}

ArrayUniformNode.prototype.isArrayUniformNode = true;

export default ArrayUniformNode;
