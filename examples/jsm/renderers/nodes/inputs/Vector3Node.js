import InputNode from '../core/InputNode.js';
import { Vector3 } from '../../../../../build/three.module.js';

class Vector3Node extends InputNode {

	constructor( value = new Vector3() ) {

		super( 'vec3' );

		this.value = value;

	}

}

export default Vector3Node;
