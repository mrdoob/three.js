import { CylinderBufferGeometry } from './CylinderBufferGeometry.js';

class ConeBufferGeometry extends CylinderBufferGeometry {

	constructor( radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) {

		super( 0, radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength );
		this.type = 'ConeBufferGeometry';

		this.parameters = {
			radius: radius,
			height: height,
			radialSegments: radialSegments,
			heightSegments: heightSegments,
			openEnded: openEnded,
			thetaStart: thetaStart,
			thetaLength: thetaLength
		};

	}

}

export { ConeBufferGeometry };
