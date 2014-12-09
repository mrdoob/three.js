/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.IndexedTypedGeometry = function () {

	THREE.BufferGeometry.call( this );

};

THREE.IndexedTypedGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.IndexedTypedGeometry.prototype.constructor = THREE.IndexedTypedGeometry;

THREE.IndexedTypedGeometry.prototype.setArrays = function ( indices, vertices, normals, uvs ) {

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
