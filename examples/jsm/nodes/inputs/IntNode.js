import { InputNode } from '../core/InputNode.js';

class IntNode extends InputNode {

	constructor( value ) {

		super( 'i' );

		this.value = Math.floor( value || 0 );

	}

	generateReadonly( builder, output, uuid, type/*, ns, needsUpdate */ ) {

		return builder.format( this.value, type, output );

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

IntNode.prototype.nodeType = 'Int';

export { IntNode };
