import InputNode from '../core/InputNode.js';
import { Matrix4 } from 'three';

class Matrix4Node extends InputNode {

	constructor( value = new Matrix4() ) {

		super( 'mat4' );

		this.value = value;

	}

}

Matrix4Node.prototype.isMatrix4Node = true;

export default Matrix4Node;
