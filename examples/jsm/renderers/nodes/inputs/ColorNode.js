import InputNode from '../core/InputNode.js';
import { Color } from 'three';

class ColorNode extends InputNode {

	constructor( value = new Color() ) {

		super( 'color' );

		this.value = value;

	}

	serialize( data ) {

		super.serialize( data );

		const { r, g, b } = this.value;

		data.r = r;
		data.g = g;
		data.b = b;

	}

	deserialize( data ) {

		super.serialize( data );

		const { r, g, b } = data;
		const value = this.value;

		value.r = r;
		value.g = g;
		value.b = b;

	}

}

ColorNode.prototype.isColorNode = true;

export default ColorNode;
