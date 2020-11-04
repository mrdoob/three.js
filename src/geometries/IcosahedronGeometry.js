import { Geometry } from '../core/Geometry.js';
import { IcosahedronBufferGeometry } from './IcosahedronBufferGeometry.js';

class IcosahedronGeometry extends Geometry {

	constructor( radius, detail ) {

		super();

		this.type = 'IcosahedronGeometry';

		this.parameters = {
			radius: radius,
			detail: detail
		};

		this.fromBufferGeometry( new IcosahedronBufferGeometry( radius, detail ) );
		this.mergeVertices();

	}

}

export { IcosahedronGeometry };
