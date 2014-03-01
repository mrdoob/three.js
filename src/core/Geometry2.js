/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Geometry2 = function ( size ) {

	THREE.BufferGeometry.call( this );

	this.vertices = new Float32Array( size * 3 );
	this.normals = new Float32Array( size * 3 );
	this.uvs = new Float32Array( size * 2 );

	this.addAttribute( 'position', this.vertices, 3 );
	this.addAttribute( 'normal', this.normals, 3 );
	this.addAttribute( 'uv', this.uvs, 2 );

	this.boundingBox = null;
	this.boundingSphere = null;

};

THREE.Geometry2.prototype = Object.create( THREE.BufferGeometry.prototype );