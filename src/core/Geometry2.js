/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Geometry2 = function ( bufferGeometry ) {

	var vertices = [];
	var normals = [];
	var uvs = [];

	var attributes = bufferGeometry.attributes;
	var length = attributes.position.array.length;

	for ( var i = 0, l = length / 3; i < l; i ++ ) {

		vertices.push( new THREE.TypedVector3( attributes.position.array, i * 3 ) );
		normals.push( new THREE.TypedVector3( attributes.normal.array, i * 3 ) );
		uvs.push( new THREE.TypedVector2( attributes.uv.array, i * 2 ) );

	}

	bufferGeometry.vertices = vertices;
	bufferGeometry.normals = normals;
	bufferGeometry.uvs = uvs;

	return bufferGeometry;

};