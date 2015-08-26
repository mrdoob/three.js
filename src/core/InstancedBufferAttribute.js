/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

THREE.InstancedBufferAttribute = function ( array, itemSize, meshPerAttribute ) {

	THREE.BufferAttribute.call( this, array, itemSize );

	this.meshPerAttribute = meshPerAttribute || 1;

};

THREE.InstancedBufferAttribute.prototype = Object.create( THREE.BufferAttribute.prototype );
THREE.InstancedBufferAttribute.prototype.constructor = THREE.InstancedBufferAttribute;

THREE.InstancedBufferAttribute.prototype.copy = function ( source ) {

	THREE.BufferAttribute.prototype.copy.call( this, source );

	this.meshPerAttribute = source.meshPerAttribute;

	return this;

};
