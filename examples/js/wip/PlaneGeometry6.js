/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PlaneGeometry6 = function ( width, height, widthSegments, heightSegments ) {

	THREE.PlaneBufferGeometry.call( this, width, height, widthSegments, heightSegments );

	var indices = this.attributes.index.array;
	var vertices = this.attributes.position.array;
	var normals = this.attributes.normal.array;
	var uvs = this.attributes.uv.array;

	this.indices = indices;
	this.vertices = [];
	this.normals = [];
	this.uvs = [];

	for ( var i = 0, l = vertices.length / 3; i < l; i ++ ) {

		this.vertices.push( new THREE.TypedVector3( vertices, i * 3 ) );
		this.normals.push( new THREE.TypedVector3( normals, i * 3 ) );
		this.uvs.push( new THREE.TypedVector2( uvs, i * 2 ) );

	}

};

THREE.PlaneGeometry6.prototype = Object.create( THREE.PlaneBufferGeometry.prototype );