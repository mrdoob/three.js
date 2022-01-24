import InputNode from '../core/InputNode.js';
import { Vector4 } from 'three';

class Vector4Node extends InputNode {

	constructor( value = new Vector4() ) {

		super( 'vec4' );

		this.value = value;

	}

	serialize( data ) {

		super.serialize( data );

		const { x, y, z, w } = this.value;

		data.x = x;
		data.y = y;
		data.z = z;
		data.w = w;

	}

	deserialize( data ) {

		super.serialize( data );

		const { x, y, z, w } = data;
		const value = this.value;

		value.x = x;
		value.y = y;
		value.z = z;
		value.w = w;

	}

}

Vector4Node.prototype.isVector4Node = true;

export default Vector4Node;
