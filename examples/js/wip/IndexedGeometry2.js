/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.IndexedGeometry2 = function () {

	THREE.BufferGeometry.call( this );

};

THREE.IndexedGeometry2.prototype = Object.create( THREE.BufferGeometry.prototype );

THREE.IndexedGeometry2.prototype.setArrays = function ( indices, vertices, normals, uvs ) {

	this.indices = indices;
	this.vertices = vertices;
	this.normals = normals;
	this.uvs = uvs;

	this.attributes[ 'index' ] = { array: indices, itemSize: 1 };
	this.attributes[ 'position' ] = { array: vertices, itemSize: 3 };
	this.attributes[ 'normal' ] = { array: normals, itemSize: 3 };
	this.attributes[ 'uv' ] = { array: uvs, itemSize: 2 };	

	return this;

};