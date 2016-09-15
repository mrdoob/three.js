import { BufferGeometry } from '../core/BufferGeometry';
import { CylinderBufferGeometry } from './CylinderBufferGeometry';

/*
 * @author: abelnation / http://github.com/abelnation
 */

function ConeBufferGeometry(
	radius, height,
	radialSegments, heightSegments,
	openEnded, thetaStart, thetaLength ) {

	CylinderBufferGeometry.call( this,
		0, radius, height,
		radialSegments, heightSegments,
		openEnded, thetaStart, thetaLength );

	this.type = 'ConeBufferGeometry';

	this.parameters = {
		radius: radius,
		height: height,
		radialSegments: radialSegments,
		heightSegments: heightSegments,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

}

ConeBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
ConeBufferGeometry.prototype.constructor = ConeBufferGeometry;


export { ConeBufferGeometry };
