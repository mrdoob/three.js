import { Geometry } from '../core/Geometry.js';
import { PolyhedronBufferGeometry } from './PolyhedronGeometry.js';

// TetrahedronGeometry

class TetrahedronGeometry extends Geometry {

	constructor( radius, detail ) {

		super();
		this.type = 'TetrahedronGeometry';

		this.parameters = {
			radius: radius,
			detail: detail
		};

		this.fromBufferGeometry( new TetrahedronBufferGeometry( radius, detail ) );
		this.mergeVertices();

	}

}


// TetrahedronBufferGeometry

class TetrahedronBufferGeometry extends PolyhedronBufferGeometry {

	constructor( radius, detail ) {

		const vertices = [
			1, 1, 1, 	- 1, - 1, 1, 	- 1, 1, - 1, 	1, - 1, - 1
		];

		const indices = [
			2, 1, 0, 	0, 3, 2,	1, 3, 0,	2, 3, 1
		];

		super( vertices, indices, radius, detail );

		this.type = 'TetrahedronBufferGeometry';

		this.parameters = {
			radius: radius,
			detail: detail
		};

	}

}


export { TetrahedronGeometry, TetrahedronBufferGeometry };
