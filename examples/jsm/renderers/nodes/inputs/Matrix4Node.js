import InputNode from '../core/InputNode.js';
import { Matrix4 } from '../../../../../build/three.module.js';

class Matrix4Node extends InputNode {

	constructor( value = new Matrix4() ) {

		super( 'mat4' );

		this.value = value;

	}

}

export default Matrix4Node;
