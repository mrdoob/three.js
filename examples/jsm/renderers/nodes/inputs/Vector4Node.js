import InputNode from '../core/InputNode.js';
import { Vector4 } from '../../../../../build/three.module.js';

class Vector4Node extends InputNode {

	constructor( value = new Vector4() ) {

		super( 'vec4' );

		this.value = value;

		Object.defineProperty( this, 'isVector4Node', { value: true } );

	}

}

export default Vector4Node;
