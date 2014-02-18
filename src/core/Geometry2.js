/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Geometry2 = function ( size ) {

	THREE.BufferGeometry.call( this );

	this.vertices = this.addAttribute( 'position', Float32Array, size, 3 ).array;
	this.normals = this.addAttribute( 'normal', Float32Array, size, 3 ).array;
	this.uvs = this.addAttribute( 'uv', Float32Array, size, 2 ).array;

	this.boundingBox = null;
	this.boundingSphere = null;

};

THREE.Geometry2.prototype = Object.create( THREE.BufferGeometry.prototype );