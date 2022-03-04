import InputNode from '../core/InputNode.js';
import { Vector2 } from 'three';

class Vector2Node extends InputNode {

	constructor( value = new Vector2() ) {

		super( 'vec2' );

		this.value = value;

	}

	serialize( data ) {

		super.serialize( data );

		const { x, y } = this.value;

		data.x = x;
		data.y = y;

	}

	deserialize( data ) {

		super.serialize( data );

		const { x, y } = data;
		const value = this.value;

		value.x = x;
		value.y = y;

	}

}

Vector2Node.prototype.isVector2Node = true;

export default Vector2Node;
