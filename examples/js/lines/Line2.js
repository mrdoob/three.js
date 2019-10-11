/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

THREE.Line2 = function ( geometry, material ) {

	THREE.LineSegments2.call( this );

	this.type = 'Line2';

	this.geometry = geometry !== undefined ? geometry : new THREE.LineGeometry();
	this.material = material !== undefined ? material : new THREE.LineMaterial( { color: Math.random() * 0xffffff } );

};

THREE.Line2.prototype = Object.assign( Object.create( THREE.LineSegments2.prototype ), {

	constructor: THREE.Line2,

	isLine2: true,

	copy: function ( /* source */ ) {

		// todo

		return this;

	}

} );
