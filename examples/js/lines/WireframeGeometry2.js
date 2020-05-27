console.warn( "THREE.WireframeGeometry2: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
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
