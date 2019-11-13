/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

THREE.WireframeGeometry2 = function ( geometry ) {

	THREE.LineSegmentsGeometry.call( this );

	this.type = 'WireframeGeometry2';

	this.fromWireframeGeometry( new THREE.WireframeGeometry( geometry ) );

	// set colors, maybe

};

THREE.WireframeGeometry2.prototype = Object.assign( Object.create( THREE.LineSegmentsGeometry.prototype ), {

	constructor: THREE.WireframeGeometry2,

	isWireframeGeometry2: true

} );
