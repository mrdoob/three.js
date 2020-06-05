import { InterleavedBuffer } from './InterleavedBuffer.js';

/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

function InstancedInterleavedBuffer( array, stride, meshPerAttribute ) {

	InterleavedBuffer.call( this, array, stride );

	this._meshPerAttribute = meshPerAttribute || 1;

	this.versionVAO = 0;

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

Object.defineProperties( InstancedInterleavedBuffer.prototype, {

	meshPerAttribute: {

		get: function () {

			return this._meshPerAttribute;

		},

		set: function ( value ) {

			this._meshPerAttribute = value;
			this.versionVAO ++;

		}

	}

} );

export { InstancedInterleavedBuffer };
