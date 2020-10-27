import { Geometry } from '../core/Geometry.js';
import { TetrahedronBufferGeometry } from './TetrahedronBufferGeometry.js';

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

export { TetrahedronGeometry };
