import { PolyhedronGeometry } from './PolyhedronGeometry.js';

class TetrahedronGeometry extends PolyhedronGeometry {

	constructor( radius = 1, detail = 0 ) {

		const vertices = [
			1, 1, 1, 	- 1, - 1, 1, 	- 1, 1, - 1, 	1, - 1, - 1
		];

		const indices = [
			2, 1, 0, 	0, 3, 2,	1, 3, 0,	2, 3, 1
		];

		super( vertices, indices, radius, detail );

		this.type = 'TetrahedronGeometry';

		this.parameters = {
			radius: radius,
			detail: detail
		};

	}

	static fromJSON( data ) {

		return new TetrahedronGeometry( data.radius, data.detail );

	}

}

export { TetrahedronGeometry };
