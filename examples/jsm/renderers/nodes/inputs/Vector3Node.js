import InputNode from '../core/InputNode.js';
import { Vector3 } from 'three';

class Vector3Node extends InputNode {

	constructor( value = new Vector3() ) {

		super( 'vec3' );

		this.value = value;

	}

}

Vector3Node.prototype.isVector3Node = true;

export default Vector3Node;
