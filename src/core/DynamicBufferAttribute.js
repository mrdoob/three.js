/**
 * @author benaadams / https://twitter.com/ben_a_adams
 * @author mrdoob / http://mrdoob.com/
 */

THREE.DynamicBufferAttribute = function ( array, itemSize ) {

	THREE.BufferAttribute.call( this, array, itemSize );

	this.updateRange = { offset: 0, count: - 1 };

};

THREE.DynamicBufferAttribute.prototype = Object.create( THREE.BufferAttribute.prototype );
THREE.DynamicBufferAttribute.prototype.constructor = THREE.DynamicBufferAttribute;

THREE.DynamicBufferAttribute.prototype.clone = function () {

	return new THREE.DynamicBufferAttribute( new this.array.constructor( this.array ), this.itemSize );

};
