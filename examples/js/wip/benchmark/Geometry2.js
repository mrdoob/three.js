/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Geometry2 = function ( size ) {

	THREE.BufferGeometry.call( this );

	this.vertices = new THREE.Float32Attribute( size, 3 );
	this.normals = new THREE.Float32Attribute( size, 3 );
	this.uvs = new THREE.Float32Attribute( size, 2 );

	this.addAttribute( 'position', this.vertices );
	this.addAttribute( 'normal', this.normals );
	this.addAttribute( 'uv', this.uvs );

};

THREE.Geometry2.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.Geometry2.prototype.constructor = THREE.Geometry2;