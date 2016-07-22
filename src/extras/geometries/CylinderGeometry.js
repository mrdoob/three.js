import { Geometry } from '../../core/Geometry';
import { CylinderBufferGeometry } from './CylinderBufferGeometry';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function CylinderGeometry ( radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) {
	this.isCylinderGeometry = this.isGeometry = true;

	Geometry.call( this );

	this.type = 'CylinderGeometry';

	this.parameters = {
		radiusTop: radiusTop,
		radiusBottom: radiusBottom,
		height: height,
		radialSegments: radialSegments,
		heightSegments: heightSegments,
		openEnded: openEnded,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	this.fromBufferGeometry( new CylinderBufferGeometry( radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) );
	this.mergeVertices();

};

CylinderGeometry.prototype = Object.create( Geometry.prototype );
CylinderGeometry.prototype.constructor = CylinderGeometry;


export { CylinderGeometry };