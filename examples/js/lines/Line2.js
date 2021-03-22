THREE.Line2 = class Line2 extends THREE.LineSegments2 {

	constructor( geometry, material ) {

		if ( geometry === undefined ) geometry = new THREE.LineGeometry();
		if ( material === undefined ) material = new THREE.LineMaterial( { color: Math.random() * 0xffffff } );

		super( geometry, material );

		this.type = 'Line2';

	}

}

THREE.Line2.prototype.isLine2 = true;
