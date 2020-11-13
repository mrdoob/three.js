import { PolyhedronBufferGeometry } from './PolyhedronBufferGeometry.js';

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

export { TetrahedronBufferGeometry };
