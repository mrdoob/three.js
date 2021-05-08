import { Vector4 } from '../../../../build/three.module.js';

import { InputNode } from '../core/InputNode.js';
import { NodeUtils } from '../core/NodeUtils.js';

class Vector4Node extends InputNode {

	constructor( x, y, z, w ) {

		super( 'v4' );

		this.value = x instanceof Vector4 ? x : new Vector4( x, y, z, w );

	}

	generateReadonly( builder, output, uuid, type/*, ns, needsUpdate*/ ) {

		return builder.format( 'vec4( ' + this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w + ' )', type, output );

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
			data.w = this.w;

			if ( this.readonly === true ) data.readonly = true;

		}

		return data;

	}

}

Vector4Node.prototype.nodeType = 'Vector4';

NodeUtils.addShortcuts( Vector4Node.prototype, 'value', [ 'x', 'y', 'z', 'w' ] );

export { Vector4Node };
