import InputNode from '../core/InputNode.js';

class IntNode extends InputNode {

	constructor( value = 0 ) {

		super( 'int' );

		this.value = value;

	}

}

IntNode.prototype.isIntNode = true;

export default IntNode;
