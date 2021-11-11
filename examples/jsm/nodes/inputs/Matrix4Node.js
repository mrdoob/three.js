import { Matrix4 } from '../../../../build/three.module.js';

import { InputNode } from '../core/InputNode.js';

class Matrix4Node extends InputNode {

	constructor( matrix ) {

		super( 'm4' );

		this.value = matrix || new Matrix4();

	}

	get elements() {

		return this.value.elements;

	}

	set elements( val ) {

		this.value.elements = val;

	}

	generateReadonly( builder, output, uuid, type /*, ns, needsUpdate */ ) {

		return builder.format( 'mat4( ' + this.value.elements.join( ', ' ) + ' )', type, output );

	}

	copy( source ) {

		super.copy( source );

		this.scope.value.fromArray( source.elements );

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.elements = this.value.elements.concat();

		}

		return data;

	}

}

Matrix4Node.prototype.nodeType = 'Matrix4';

export { Matrix4Node };
