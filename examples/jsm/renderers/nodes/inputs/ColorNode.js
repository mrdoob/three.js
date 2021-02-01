import InputNode from '../core/InputNode.js';

class ColorNode extends InputNode {

	constructor( value ) {

		super( 'color' );

		this.value = value;

	}

}

export default ColorNode;
