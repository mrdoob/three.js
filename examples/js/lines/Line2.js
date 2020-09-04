console.warn( "THREE.Line2: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/#manual/en/introduction/Installation." );

THREE.Line2 = function ( geometry, material ) {

	if ( geometry === undefined ) geometry = new THREE.LineGeometry();
	if ( material === undefined ) material = new THREE.LineMaterial( { color: Math.random() * 0xffffff } );

	THREE.LineSegments2.call( this, geometry, material );

	this.type = 'Line2';

};

THREE.Line2.prototype = Object.assign( Object.create( THREE.LineSegments2.prototype ), {

	constructor: THREE.Line2,

	isLine2: true

} );
