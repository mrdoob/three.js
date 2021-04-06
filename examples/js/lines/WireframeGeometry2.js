( function () {

	var WireframeGeometry2 = function ( geometry ) {

		THREE.LineSegmentsGeometry.call( this );
		this.type = 'WireframeGeometry2';
		this.fromWireframeGeometry( new THREE.WireframeGeometry( geometry ) ); // set colors, maybe

	};

	WireframeGeometry2.prototype = Object.assign( Object.create( THREE.LineSegmentsGeometry.prototype ), {
		constructor: WireframeGeometry2,
		isWireframeGeometry2: true
	} );

	THREE.WireframeGeometry2 = WireframeGeometry2;

} )();
