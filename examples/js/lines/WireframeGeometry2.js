( function () {

	class WireframeGeometry2 extends THREE.LineSegmentsGeometry {

		constructor( geometry ) {

			super();
			this.isWireframeGeometry2 = true;
			this.type = 'WireframeGeometry2';
			this.fromWireframeGeometry( new THREE.WireframeGeometry( geometry ) ); // set colors, maybe

		}

	}

	THREE.WireframeGeometry2 = WireframeGeometry2;

} )();
