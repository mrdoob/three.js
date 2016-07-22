import { Geometry } from '../../core/Geometry';
import { SphereBufferGeometry } from './SphereBufferGeometry';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function SphereGeometry ( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength ) {
	this.isSphereGeometry = this.isGeometry = true;

	Geometry.call( this );

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

};

SphereGeometry.prototype = Object.create( Geometry.prototype );
SphereGeometry.prototype.constructor = SphereGeometry;


export { SphereGeometry };