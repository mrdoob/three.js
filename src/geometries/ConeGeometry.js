import { CylinderGeometry } from './CylinderGeometry';

/**
 * @author abelnation / http://github.com/abelnation
 */

function ConeGeometry( radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) {

	CylinderGeometry.call( this, 0, radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength );

	this.type = 'ConeGeometry';

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

ConeGeometry.prototype = Object.create( CylinderGeometry.prototype );
ConeGeometry.prototype.constructor = ConeGeometry;


export { ConeGeometry };
