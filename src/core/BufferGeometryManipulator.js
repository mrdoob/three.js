/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BufferGeometryManipulator = function ( bufferGeometry ) {

	this.vertices = [];
	this.normals = [];
	this.uvs = [];

	var attributes = bufferGeometry.attributes;
	var length = attributes.position.array.length;

	for ( var i = 0, l = length / 3; i < l; i ++ ) {

		this.vertices.push( new THREE.TypedVector3( attributes.position.array, i * 3 ) );
		this.normals.push( new THREE.TypedVector3( attributes.normal.array, i * 3 ) );
		this.uvs.push( new THREE.TypedVector2( attributes.uv.array, i * 2 ) );

	}

};