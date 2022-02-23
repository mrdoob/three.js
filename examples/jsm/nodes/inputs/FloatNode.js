import InputNode from '../core/InputNode.js';

class FloatNode extends InputNode {

	constructor( value = 0 ) {

		super( 'float' );

		this.value = value;

	}

	serialize( data ) {

		super.serialize( data );

		data.value = this.value;

	}

	deserialize( data ) {

		super.serialize( data );

		data.value = this.value;

	}

}

FloatNode.prototype.isFloatNode = true;

export default FloatNode;
