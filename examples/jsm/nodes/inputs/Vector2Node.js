import { Vector2 } from 'three';

import { InputNode } from '../core/InputNode.js';
import { NodeUtils } from '../core/NodeUtils.js';

class Vector2Node extends InputNode {

	constructor( x, y ) {

		super( 'v2' );

		this.value = x instanceof Vector2 ? x : new Vector2( x, y );

	}

	generateReadonly( builder, output, uuid, type/*, ns, needsUpdate*/ ) {

		return builder.format( 'vec2( ' + this.x + ', ' + this.y + ' )', type, output );

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

			if ( this.readonly === true ) data.readonly = true;

		}

		return data;

	}

}

Vector2Node.prototype.nodeType = 'Vector2';

NodeUtils.addShortcuts( Vector2Node.prototype, 'value', [ 'x', 'y' ] );

export { Vector2Node };
