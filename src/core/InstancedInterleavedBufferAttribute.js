import { InterleavedBufferAttribute } from './InterleavedBufferAttribute.js';

function InstancedInterleavedBufferAttribute( buffer, itemSize, type, normalized, stride, offset, count, meshPerAttribute ) {

	InterleavedBufferAttribute.call( this, buffer, itemSize, type, normalized, stride, offset, count );

	this.meshPerAttribute = meshPerAttribute || 1;

}

InstancedInterleavedBufferAttribute.prototype = Object.assign( Object.create( InterleavedBufferAttribute.prototype ), {

	constructor: InstancedInterleavedBufferAttribute,

	isInstancedInterleavedBufferAttribute: true,

	copy: function ( source ) {

		InterleavedBufferAttribute.prototype.copy.call( this, source );

		this.meshPerAttribute = source.meshPerAttribute;

		return this;

	},

	clone: function ( data ) {

		const ib = InterleavedBufferAttribute.prototype.clone.call( this, data );

		ib.meshPerAttribute = this.meshPerAttribute;

		return ib;

	},

	toJSON: function ( data ) {

		const json = InterleavedBufferAttribute.prototype.toJSON.call( this, data );

		json.isInstancedInterleavedBufferAttribute = true;
		json.meshPerAttribute = this.meshPerAttribute;

		return json;

	}

} );

export { InstancedInterleavedBufferAttribute };
