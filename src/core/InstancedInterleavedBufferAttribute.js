import { InterleavedBufferAttribute } from './InterleavedBufferAttribute.js';

class InstancedInterleavedBufferAttribute extends InterleavedBufferAttribute {

	constructor( buffer, itemSize, type, normalized, stride, offset, count, meshPerAttribute ) {

		super( buffer, itemSize, type, normalized, stride, offset, count );

		this.meshPerAttribute = meshPerAttribute || 1;

	}

	copy( source ) {

		super.copy( source );

		this.meshPerAttribute = source.meshPerAttribute;

		return this;

	}

	clone( data ) {

		const ib = super.clone( data );

		ib.meshPerAttribute = this.meshPerAttribute;

		return ib;

	}

	toJSON( data ) {

		const json = super.toJSON( data );

		json.isInstancedInterleavedBufferAttribute = true;
		json.meshPerAttribute = this.meshPerAttribute;

		return json;

	}

}

InstancedInterleavedBufferAttribute.prototype.isInstancedInterleavedBufferAttribute = true;

export { InstancedInterleavedBufferAttribute };
