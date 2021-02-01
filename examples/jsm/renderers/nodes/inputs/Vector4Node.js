import InputNode from '../core/InputNode.js';

class Vector4Node extends InputNode {

	constructor( value ) {

		super( 'vec4' );

		this.value = value;

	}

}

export default Vector4Node;
