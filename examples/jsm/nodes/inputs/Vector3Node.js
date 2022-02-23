import InputNode from '../core/InputNode.js';
import { Vector3 } from 'three';

class Vector3Node extends InputNode {

	constructor( value = new Vector3() ) {

		super( 'vec3' );

		this.value = value;

	}

	serialize( data ) {

		super.serialize( data );

		const { x, y, z } = this.value;

		data.x = x;
		data.y = y;
		data.z = z;

	}

	deserialize( data ) {

		super.serialize( data );

		const { x, y, z } = data;
		const value = this.value;

		value.x = x;
		value.y = y;
		value.z = z;

	}

}

Vector3Node.prototype.isVector3Node = true;

export default Vector3Node;
