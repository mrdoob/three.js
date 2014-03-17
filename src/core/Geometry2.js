/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Geometry2 = function ( vertices, normals, uvs ) {

	THREE.BufferGeometry.call( this );

	this.attributes[ 'position' ] = { array: vertices, itemSize: 3 };
	this.attributes[ 'normal' ] = { array: normals, itemSize: 3 };
	this.attributes[ 'uv' ] = { array: uvs, itemSize: 2 };	

};

THREE.Geometry2.prototype = Object.create( THREE.BufferGeometry.prototype );