/**
 * @author abelnation / http://github.com/abelnation
 */

import { CylinderGeometry } from './CylinderGeometry';

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

/**
 * @author: abelnation / http://github.com/abelnation
 */

import { CylinderBufferGeometry } from './CylinderGeometry';

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

export { ConeGeometry, ConeBufferGeometry };
