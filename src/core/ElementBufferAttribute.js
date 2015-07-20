THREE.ElementBufferAttribute = function ( array, itemSize, grouping ) {

	THREE.BufferAttribute.call( this, array, itemSize );

	this.grouping = grouping;

};

THREE.ElementBufferAttribute.prototype = Object.create( THREE.BufferAttribute.prototype );
THREE.ElementBufferAttribute.prototype.constructor = THREE.ElementBufferAttribute;

THREE.ElementBufferAttribute.prototype.clone = function () {

	return new THREE.ElementBufferAttribute( new this.array.constructor( this.array ), this.itemSize, this.grouping );

};
