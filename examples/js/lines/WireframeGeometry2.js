( function () {

	class WireframeGeometry2 extends THREE.LineSegmentsGeometry {

		constructor( geometry ) {

			super();
			this.type = 'WireframeGeometry2';
			this.fromWireframeGeometry( new THREE.WireframeGeometry( geometry ) ); // set colors, maybe

		}

	}

	WireframeGeometry2.prototype.isWireframeGeometry2 = true;

	THREE.WireframeGeometry2 = WireframeGeometry2;

} )();
