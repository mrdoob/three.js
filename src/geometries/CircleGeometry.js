import { Geometry } from '../core/Geometry';
import { CircleBufferGeometry } from './CircleBufferGeometry';

/**
 * @author hughes
 */

function CircleGeometry( radius, segments, thetaStart, thetaLength ) {

	Geometry.call( this );

	this.type = 'CircleGeometry';

	this.parameters = {
		radius: radius,
		segments: segments,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	this.fromBufferGeometry( new CircleBufferGeometry( radius, segments, thetaStart, thetaLength ) );

}

CircleGeometry.prototype = Object.create( Geometry.prototype );
CircleGeometry.prototype.constructor = CircleGeometry;


export { CircleGeometry };
