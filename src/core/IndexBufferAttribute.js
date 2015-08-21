/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.IndexBufferAttribute = function ( array, itemSize ) {

	THREE.BufferAttribute.call( this, array, itemSize );

};

THREE.IndexBufferAttribute.prototype = Object.create( THREE.BufferAttribute.prototype );
THREE.IndexBufferAttribute.prototype.constructor = THREE.IndexBufferAttribute;
