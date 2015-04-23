/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Geometry3 = function ( size ) {

	THREE.BufferGeometry.call( this );

	var verticesBuffer = new ArrayBuffer( size * 3 * 4 );
	var normalsBuffer = new ArrayBuffer( size * 3 * 4 );
	var uvsBuffer = new ArrayBuffer( size * 2 * 4 );

	this.vertices = [];
	this.normals = [];
	this.uvs = [];

	for ( var i = 0; i < size; i ++ ) {

		this.vertices.push( new Float32Array( verticesBuffer, i * 3 * 4, 3 ) );
		this.normals.push( new Float32Array( normalsBuffer, i * 3 * 4, 3 ) );
		this.uvs.push( new Float32Array( uvsBuffer, i * 2 * 4, 2 ) );

	}

	this.attributes[ 'position' ] = { array: new Float32Array( verticesBuffer, 0, size * 3 ), itemSize: 3 };
	this.attributes[ 'normal' ] = { array: new Float32Array( normalsBuffer, 0, size * 3 ), itemSize: 3 };
	this.attributes[ 'uv' ] = { array: new Float32Array( uvsBuffer, 0, size * 2 ), itemSize: 2 };

};

THREE.Geometry3.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.Geometry3.prototype.constructor = THREE.Geometry3;