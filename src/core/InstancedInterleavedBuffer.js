/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

THREE.InstancedInterleavedBuffer = function ( array, stride, meshPerAttribute ) {

	THREE.InterleavedBuffer.call( this, array, stride );

	this.meshPerAttribute = meshPerAttribute || 1;

};

THREE.InstancedInterleavedBuffer.prototype = Object.create( THREE.InterleavedBuffer.prototype );
THREE.InstancedInterleavedBuffer.prototype.constructor = THREE.InstancedInterleavedBuffer;

THREE.InstancedInterleavedBuffer.prototype.clone = function () {

	return new this.constructor( new this.array.constructor( this.array ), this.stride, this.meshPerAttribute );

};
