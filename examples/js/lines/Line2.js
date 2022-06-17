( function () {

	class Line2 extends THREE.LineSegments2 {

		constructor( geometry = new THREE.LineGeometry(), material = new THREE.LineMaterial( {
			color: Math.random() * 0xffffff
		} ) ) {

			super( geometry, material );
			this.isLine2 = true;
			this.type = 'Line2';

		}

	}

	THREE.Line2 = Line2;

} )();
