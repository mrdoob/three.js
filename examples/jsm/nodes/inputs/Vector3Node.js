import { Vector3 } from 'three';

import { InputNode } from '../core/InputNode.js';
import { NodeUtils } from '../core/NodeUtils.js';

class Vector3Node extends InputNode {

	constructor( x, y, z ) {

		super( 'v3' );

		this.value = x instanceof Vector3 ? x : new Vector3( x, y, z );

	}

	generateReadonly( builder, output, uuid, type/*, ns, needsUpdate*/ ) {

		return builder.format( 'vec3( ' + this.x + ', ' + this.y + ', ' + this.z + ' )', type, output );

	}

	copy( source ) {

		super.copy( source );

		this.value.copy( source );

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.x = this.x;
			data.y = this.y;
			data.z = this.z;

			if ( this.readonly === true ) data.readonly = true;

		}

		return data;

	}

}

Vector3Node.prototype.nodeType = 'Vector3';

NodeUtils.addShortcuts( Vector3Node.prototype, 'value', [ 'x', 'y', 'z' ] );

export { Vector3Node };
