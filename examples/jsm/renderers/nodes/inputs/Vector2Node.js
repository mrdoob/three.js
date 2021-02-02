import InputNode from '../core/InputNode.js';

class Vector2Node extends InputNode {

	constructor( value ) {

		super( 'vec2' );

		this.value = value;

		Object.defineProperty( this, 'isVector2Node', { value: true } );

	}

}

export default Vector2Node;
