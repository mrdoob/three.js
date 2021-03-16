import { InterleavedBuffer } from './InterleavedBuffer.js';

function InstancedInterleavedBuffer( array, stride, meshPerAttribute ) {

	InterleavedBuffer.call( this, array, stride );

	this.meshPerAttribute = meshPerAttribute || 1;

}

InstancedInterleavedBuffer.prototype = Object.assign( Object.create( InterleavedBuffer.prototype ), {

	constructor: InstancedInterleavedBuffer,

	isInstancedInterleavedBuffer: true,

	copy: function ( source ) {

		InterleavedBuffer.prototype.copy.call( this, source );

		this.meshPerAttribute = source.meshPerAttribute;

		return this;

	},

	clone: function ( data ) {

		const ib = InterleavedBuffer.prototype.clone.call( this, data );

		ib.meshPerAttribute = this.meshPerAttribute;

		return ib;

	},

	toJSON: function ( data ) {

		const json = InterleavedBuffer.prototype.toJSON.call( this, data );

		json.isInstancedInterleavedBuffer = true;
		json.meshPerAttribute = this.meshPerAttribute;

		return json;

	}

} );

export { InstancedInterleavedBuffer };
