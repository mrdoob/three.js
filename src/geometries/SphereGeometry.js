import { Geometry } from '../core/Geometry.js';
import { SphereBufferGeometry } from './SphereBufferGeometry.js';

class SphereGeometry extends Geometry {

	constructor( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength ) {

		super();
		this.type = 'SphereGeometry';

		this.parameters = {
			radius: radius,
			widthSegments: widthSegments,
			heightSegments: heightSegments,
			phiStart: phiStart,
			phiLength: phiLength,
			thetaStart: thetaStart,
			thetaLength: thetaLength
		};

		this.fromBufferGeometry( new SphereBufferGeometry( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength ) );
		this.mergeVertices();

	}

}

export { SphereGeometry };
