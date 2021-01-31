import InputNode from '../core/InputNode.js';
import { Vector3 } from '../../../../../build/three.module.js';

class Vector3Node extends InputNode {

	constructor( value = new Vector3() ) {

		super( 'vec3' );

		this.value = value;

		Object.defineProperty( this, 'isVector3Node', { value: true } );

	}

}

export default Vector3Node;
