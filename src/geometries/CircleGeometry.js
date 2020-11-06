import { Geometry } from '../core/Geometry.js';
import { CircleBufferGeometry } from './CircleBufferGeometry.js';

class CircleGeometry extends Geometry {

	constructor( radius, segments, thetaStart, thetaLength ) {

		super();
		this.type = 'CircleGeometry';

		this.parameters = {
			radius: radius,
			segments: segments,
			thetaStart: thetaStart,
			thetaLength: thetaLength
		};

		this.fromBufferGeometry( new CircleBufferGeometry( radius, segments, thetaStart, thetaLength ) );
		this.mergeVertices();

	}

}

export { CircleGeometry };
