( function () {

	var Line2 = function ( geometry, material ) {

		if ( geometry === undefined ) geometry = new THREE.LineGeometry();
		if ( material === undefined ) material = new THREE.LineMaterial( {
			color: Math.random() * 0xffffff
		} );
		THREE.LineSegments2.call( this, geometry, material );
		this.type = 'Line2';

	};

	Line2.prototype = Object.assign( Object.create( THREE.LineSegments2.prototype ), {
		constructor: Line2,
		isLine2: true
	} );

	THREE.Line2 = Line2;

} )();
