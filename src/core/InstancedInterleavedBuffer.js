/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

module.exports = InstancedInterleavedBuffer;

var InterleavedBuffer = require( "./InterleavedBuffer" );

function InstancedInterleavedBuffer( array, stride, meshPerAttribute ) {

	InterleavedBuffer.call( this, array, stride );

	this.meshPerAttribute = meshPerAttribute || 1;

}

InstancedInterleavedBuffer.prototype = Object.create( InterleavedBuffer.prototype );
InstancedInterleavedBuffer.prototype.constructor = InstancedInterleavedBuffer;

InstancedInterleavedBuffer.prototype.copy = function ( source ) {

	InterleavedBuffer.prototype.copy.call( this, source );

	this.meshPerAttribute = source.meshPerAttribute;

	return this;

};
