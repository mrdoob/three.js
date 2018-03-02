/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

THREE.Wireframe = function ( geometry, material ) {

	THREE.Mesh.call( this );

	this.type = 'Wireframe';

	this.geometry = geometry !== undefined ? geometry : new THREE.LineSegmentsGeometry();
	this.material = material !== undefined ? material : new THREE.LineMaterial( { color: Math.random() * 0xffffff } );

};

THREE.Wireframe.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

	constructor: THREE.Wireframe,

	isWireframe: true,

	copy: function ( source ) {

		// todo

		return this;

	}

} );
