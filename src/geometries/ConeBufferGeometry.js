import { CylinderBufferGeometry } from './CylinderBufferGeometry';

/**
 * @author: abelnation / http://github.com/abelnation
 */

function ConeBufferGeometry( radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) {

	CylinderBufferGeometry.call( this, 0, radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength );

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

ConeBufferGeometry.prototype = Object.create( CylinderBufferGeometry.prototype );
ConeBufferGeometry.prototype.constructor = ConeBufferGeometry;


export { ConeBufferGeometry };
