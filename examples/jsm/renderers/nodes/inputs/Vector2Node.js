import InputNode from '../core/InputNode.js';
import { Vector2 } from '../../../../../build/three.module.js';

class Vector2Node extends InputNode {

	constructor( value = new Vector2() ) {

		super( 'vec2' );

		this.value = value;

		Object.defineProperty( this, 'isVector2Node', { value: true } );

	}

}

export default Vector2Node;
