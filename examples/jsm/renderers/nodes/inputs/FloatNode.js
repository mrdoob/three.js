import InputNode from '../core/InputNode.js';

class FloatNode extends InputNode {

	constructor( value ) {

		super( 'float' );

		this.value = value;

	}

	generateConst( builder ) {

		return builder.generateFloat( this.value );

	}

}

export default FloatNode;
