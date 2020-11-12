import { Geometry } from '../core/Geometry.js';
import { PolyhedronBufferGeometry } from './PolyhedronBufferGeometry.js';

class PolyhedronGeometry extends Geometry {

	constructor( vertices, indices, radius, detail ) {

		super();

		this.type = 'PolyhedronGeometry';

		this.parameters = {
			vertices: vertices,
			indices: indices,
			radius: radius,
			detail: detail
		};

		this.fromBufferGeometry( new PolyhedronBufferGeometry( vertices, indices, radius, detail ) );
		this.mergeVertices();

	}

}

export { PolyhedronGeometry };
