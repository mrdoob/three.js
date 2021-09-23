import InputNode from './InputNode.js';

class ArrayInputNode extends InputNode {

	constructor( value = [] ) {

		super();

		this.value = value;

	}

	getNodeType( builder ) {

		return this.value[ 0 ].getNodeType( builder );

	}

}

ArrayInputNode.prototype.isArrayInputNode = true;

export default ArrayInputNode;
