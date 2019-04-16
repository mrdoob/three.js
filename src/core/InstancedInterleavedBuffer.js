import { InterleavedBuffer } from './InterleavedBuffer.js';

/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

function InstancedInterleavedBuffer( array, stride, meshPerAttribute ) {

	InterleavedBuffer.call( this, array, stride );

	this._meshPerAttribute = meshPerAttribute || 1;

}

InstancedInterleavedBuffer.prototype = Object.assign( Object.create( InterleavedBuffer.prototype ), {

	constructor: InstancedInterleavedBuffer,

	isInstancedInterleavedBuffer: true,

	_copy: function ( source ) {

		InterleavedBuffer.prototype.copy.call( this, source );

		this._meshPerAttribute = source.meshPerAttribute;

		return this;

	}

} );

Object.defineProperties( InstancedInterleavedBuffer.prototype, {

	meshPerAttribute: {

		get: function () {

			return this._meshPerAttribute;

		},

		set: function ( value ) {

			console.warn( 'THREE.InstancedInterleavedBuffer: .meshPerAttribute is readonly.' );

		}

	}

} );

export { InstancedInterleavedBuffer };
