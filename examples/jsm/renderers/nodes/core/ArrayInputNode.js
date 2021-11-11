import InputNode from './InputNode.js';

class ArrayInputNode extends InputNode {

	constructor( nodes = [] ) {

		super();

		this.nodes = nodes;

	}

	getNodeType( builder ) {

		return this.nodes[ 0 ].getNodeType( builder );

	}

}

ArrayInputNode.prototype.isArrayInputNode = true;

export default ArrayInputNode;
