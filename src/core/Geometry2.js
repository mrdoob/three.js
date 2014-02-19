/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Geometry2 = function ( size ) {

	THREE.BufferGeometry.call( this );

	this.addAttribute( 'position', new Float32Array( size * 3 ), 3 );
	this.addAttribute( 'normal', new Float32Array( size * 3 ), 3 );
	this.addAttribute( 'uv', new Float32Array( size * 2 ), 2 );

	this.vertices = this.getAttribute( 'position' ).array;
	this.normals = this.getAttribute( 'normal' ).array;
	this.uvs = this.getAttribute( 'uv' ).array;

	this.boundingBox = null;
	this.boundingSphere = null;

};

THREE.Geometry2.prototype = Object.create( THREE.BufferGeometry.prototype );