import InputNode from '../core/InputNode.js';
import { Matrix3 } from '../../../../../build/three.module.js';

class Matrix3Node extends InputNode {

	constructor( value = new Matrix3() ) {

		super( 'mat3' );

		this.value = value;

	}

}

export default Matrix3Node;
