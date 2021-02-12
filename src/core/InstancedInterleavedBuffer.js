import { InterleavedBuffer } from './InterleavedBuffer.js';

class InstancedInterleavedBuffer extends InterleavedBuffer {

	constructor( array, stride, meshPerAttribute = 1 ) {

		super( array, stride );

		Object.defineProperty( this, 'isInstancedInterleavedBuffer', { value: true } );

		this.meshPerAttribute = meshPerAttribute;

	}

	copy( source ) {

		InterleavedBuffer.prototype.copy.call( this, source );

		this.meshPerAttribute = source.meshPerAttribute;

		return this;

	}

	clone( data ) {

		const ib = InterleavedBuffer.prototype.clone.call( this, data );

		ib.meshPerAttribute = this.meshPerAttribute;

		return ib;

	}

	toJSON( data ) {

		const json = InterleavedBuffer.prototype.toJSON.call( this, data );

		json.isInstancedInterleavedBuffer = true;
		json.meshPerAttribute = this.meshPerAttribute;

		return json;

	}

}

export { InstancedInterleavedBuffer };
