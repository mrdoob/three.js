import { Geometry } from '../core/Geometry';
import { TetrahedronBufferGeometry } from './TetrahedronBufferGeometry';

/**
 * @author timothypratley / https://github.com/timothypratley
 */

function TetrahedronGeometry( radius, detail ) {

	Geometry.call( this );

	this.type = 'TetrahedronGeometry';

	this.parameters = {
		radius: radius,
		detail: detail
	};

	this.fromBufferGeometry( new TetrahedronBufferGeometry( radius, detail ) );
	this.mergeVertices();

}

TetrahedronGeometry.prototype = Object.create( Geometry.prototype );
TetrahedronGeometry.prototype.constructor = TetrahedronGeometry;


export { TetrahedronGeometry };
