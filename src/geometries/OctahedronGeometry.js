import { Geometry } from '../core/Geometry.js';
import { OctahedronBufferGeometry } from './OctahedronBufferGeometry.js';

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

export { OctahedronGeometry };
