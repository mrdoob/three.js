import { Geometry } from '../core/Geometry';
import { OctahedronBufferGeometry } from './OctahedronBufferGeometry';

/**
 * @author timothypratley / https://github.com/timothypratley
 */

function OctahedronGeometry( radius, detail ) {

	Geometry.call( this );

	this.type = 'OctahedronGeometry';

	this.parameters = {
		radius: radius,
		detail: detail
	};

	this.fromBufferGeometry( new OctahedronBufferGeometry( radius, detail ) );
	this.mergeVertices();

}

OctahedronGeometry.prototype = Object.create( Geometry.prototype );
OctahedronGeometry.prototype.constructor = OctahedronGeometry;


export { OctahedronGeometry };
