import InputNode from '../core/InputNode.js';

class UintNode extends InputNode {

	constructor( value = 0 ) {

		super( 'uint' );

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

UintNode.prototype.isUintNode = true;

export default UintNode;
