import { Geometry } from '../core/Geometry.js';
import { DodecahedronBufferGeometry } from './DodecahedronBufferGeometry.js';

class DodecahedronGeometry extends Geometry {

	constructor( radius, detail ) {

		super();
		this.type = 'DodecahedronGeometry';

		this.parameters = {
			radius: radius,
			detail: detail
		};

		this.fromBufferGeometry( new DodecahedronBufferGeometry( radius, detail ) );
		this.mergeVertices();

	}

}

export { DodecahedronGeometry };
