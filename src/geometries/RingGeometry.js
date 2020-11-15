import { Geometry } from '../core/Geometry.js';
import { RingBufferGeometry } from './RingBufferGeometry.js';

class RingGeometry extends Geometry {

	constructor( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

		super();

		this.type = 'RingGeometry';

		this.parameters = {
			innerRadius: innerRadius,
			outerRadius: outerRadius,
			thetaSegments: thetaSegments,
			phiSegments: phiSegments,
			thetaStart: thetaStart,
			thetaLength: thetaLength
		};

		this.fromBufferGeometry( new RingBufferGeometry( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) );
		this.mergeVertices();

	}

}

export { RingGeometry };
