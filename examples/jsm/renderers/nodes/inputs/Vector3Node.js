import InputNode from '../core/InputNode.js';

class Vector3Node extends InputNode {

	constructor( value ) {

		super( 'vec3' );

		this.value = value;

	}

}

export default Vector3Node;
