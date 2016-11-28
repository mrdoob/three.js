import { Geometry } from '../core/Geometry';
import { IcosahedronBufferGeometry } from './IcosahedronBufferGeometry';

/**
 * @author timothypratley / https://github.com/timothypratley
 */

function IcosahedronGeometry( radius, detail ) {

 	Geometry.call( this );

	this.type = 'IcosahedronGeometry';

	this.parameters = {
		radius: radius,
		detail: detail
	};

	this.fromBufferGeometry( new IcosahedronBufferGeometry( radius, detail ) );
	this.mergeVertices();

}

IcosahedronGeometry.prototype = Object.create( Geometry.prototype );
IcosahedronGeometry.prototype.constructor = IcosahedronGeometry;


export { IcosahedronGeometry };
