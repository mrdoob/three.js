import InputNode from '../core/InputNode.js';

class BoolNode extends InputNode {

	constructor( value = false ) {

		super( 'bool' );

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

BoolNode.prototype.isBoolNode = true;

export default BoolNode;
