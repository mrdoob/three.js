import { InputNode } from '../core/InputNode.js';

class FloatNode extends InputNode {

	constructor( value ) {

		super( 'f' );

		this.value = value || 0;

	}

	generateReadonly( builder, output, uuid, type/*, ns, needsUpdate */ ) {

		return builder.format( this.value + ( this.value % 1 ? '' : '.0' ), type, output );

	}

	copy( source ) {

		super.copy( source );

		this.value = source.value;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.value = this.value;

			if ( this.readonly === true ) data.readonly = true;

		}

		return data;

	}

}

FloatNode.prototype.nodeType = 'Float';

export { FloatNode };
