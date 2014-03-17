/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BufferGeometryManipulator = function ( bufferGeometry ) {

	this.vertices = [];
	this.normals = [];
	this.uvs = [];

	var attributes = bufferGeometry.attributes;
	var length = attributes.position.array.length / 3;

	for ( var i = 0; i < length; i ++ ) {

		this.vertices.push( new THREE.ProxyVector3( attributes.position.array, i * 3 ) );
		this.normals.push( new THREE.ProxyVector3( attributes.normal.array, i * 3 ) );
		this.uvs.push( new THREE.ProxyVector2( attributes.uv.array, i * 2 ) );

	}

};