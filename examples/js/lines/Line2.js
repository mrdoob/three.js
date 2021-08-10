( function () {

	class Line2 extends THREE.LineSegments2 {

		constructor( geometry = new THREE.LineGeometry(), material = new THREE.LineMaterial( {
			color: Math.random() * 0xffffff
		} ) ) {

			super( geometry, material );
			this.type = 'Line2';

		}

	}

	Line2.prototype.isLine2 = true;

	THREE.Line2 = Line2;

} )();
