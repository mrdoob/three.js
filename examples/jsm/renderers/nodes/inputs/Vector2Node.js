import InputNode from '../core/InputNode.js';
import { Vector2 } from 'three';

class Vector2Node extends InputNode {

	constructor( value = new Vector2() ) {

		super( 'vec2' );

		this.value = value;

	}

}

Vector2Node.prototype.isVector2Node = true;

export default Vector2Node;
