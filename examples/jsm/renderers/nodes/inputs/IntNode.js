import InputNode from '../core/InputNode.js';

class IntNode extends InputNode {

	constructor( value = 0 ) {

		super( 'int' );

		this.value = value;

	}

	serialize( data ) {

		super.serialize( data );

		data.value = this.value;

	}

	deserialize( data ) {

		super.serialize( data );

		this.value = data.value;

	}

}

IntNode.prototype.isIntNode = true;

export default IntNode;
