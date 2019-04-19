import { InterleavedBuffer } from './InterleavedBuffer.js';

/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

function InstancedInterleavedBuffer( array, stride, meshPerAttribute ) {

	InterleavedBuffer.call( this, array, stride );

	this._meshPerAttribute = meshPerAttribute || 1;

	this.version2 = 0;

}

InstancedInterleavedBuffer.prototype = Object.assign( Object.create( InterleavedBuffer.prototype ), {

	constructor: InstancedInterleavedBuffer,

	isInstancedInterleavedBuffer: true,

	copy: function ( source ) {

		InterleavedBuffer.prototype.copy.call( this, source );

		this.meshPerAttribute = source.meshPerAttribute;

		return this;

	}

} );

Object.defineProperties( InstancedInterleavedBuffer.prototype, {

	meshPerAttribute: {

		get: function () {

			return this._meshPerAttribute;

		},

		set: function ( value ) {

			this._meshPerAttribute = value;
			this.version2 ++;

		}

	}

} );

export { InstancedInterleavedBuffer };
