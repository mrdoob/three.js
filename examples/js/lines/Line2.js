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
