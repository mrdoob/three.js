import { Geometry } from '../core/Geometry.js';
import { LatheBufferGeometry } from './LatheBufferGeometry.js';

class LatheGeometry extends Geometry {

	constructor( points, segments, phiStart, phiLength ) {

		super();

		this.type = 'LatheGeometry';

		this.parameters = {
			points: points,
			segments: segments,
			phiStart: phiStart,
			phiLength: phiLength
		};

		this.fromBufferGeometry( new LatheBufferGeometry( points, segments, phiStart, phiLength ) );
		this.mergeVertices();

	}

}

export { LatheGeometry };
