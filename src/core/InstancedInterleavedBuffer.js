/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

THREE.InstancedInterleavedBuffer = function ( array, stride, meshPerAttribute ) {

	THREE.InterleavedBuffer.call( this, array, stride );

	this.meshPerAttribute = meshPerAttribute || 1;

};

THREE.InstancedInterleavedBuffer.prototype = Object.create( THREE.InterleavedBuffer.prototype );
THREE.InstancedInterleavedBuffer.prototype.constructor = THREE.InstancedInterleavedBuffer;

THREE.InstancedInterleavedBuffer.prototype.copy = function ( source ) {

	THREE.InterleavedBuffer.prototype.copy.call( this, source );

	this.meshPerAttribute = source.meshPerAttribute;

	return this;

};
