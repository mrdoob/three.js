import InputNode from './InputNode.js';

class ArrayInputNode extends InputNode {

	constructor( value = [] ) {

		super();

		this.value = value;

	}

	getType( builder ) {

		return this.value[ 0 ].getType( builder );

	}

}

ArrayInputNode.prototype.isArrayInputNode = true;

export default ArrayInputNode;
