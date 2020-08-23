import { Geometry } from '../core/Geometry.js';
import { PolyhedronBufferGeometry } from './PolyhedronGeometry.js';

// OctahedronGeometry

class OctahedronGeometry extends Geometry {

	constructor( radius, detail ) {

		super();

		this.type = 'OctahedronGeometry';

		this.parameters = {
			radius: radius,
			detail: detail
		};

		this.fromBufferGeometry( new OctahedronBufferGeometry( radius, detail ) );
		this.mergeVertices();

	}

}

// OctahedronBufferGeometry

class OctahedronBufferGeometry extends PolyhedronBufferGeometry {

	constructor( radius, detail ) {

		const vertices = [
			1, 0, 0, 	- 1, 0, 0,	0, 1, 0,
			0, - 1, 0, 	0, 0, 1,	0, 0, - 1
		];

		const indices = [
			0, 2, 4,	0, 4, 3,	0, 3, 5,
			0, 5, 2,	1, 2, 5,	1, 5, 3,
			1, 3, 4,	1, 4, 2
		];

		super( vertices, indices, radius, detail );

		this.type = 'OctahedronBufferGeometry';

		this.parameters = {
			radius: radius,
			detail: detail
		};

	}

}


export { OctahedronGeometry, OctahedronBufferGeometry };
