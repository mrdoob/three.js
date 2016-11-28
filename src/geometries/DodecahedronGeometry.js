import { Geometry } from '../core/Geometry';
import { DodecahedronBufferGeometry } from './DodecahedronBufferGeometry';

/**
 * @author Abe Pazos / https://hamoid.com
 */

function DodecahedronGeometry( radius, detail ) {

	Geometry.call( this );

	this.type = 'DodecahedronGeometry';

	this.parameters = {
		radius: radius,
		detail: detail
	};

	this.fromBufferGeometry( new DodecahedronBufferGeometry( radius, detail ) );
	this.mergeVertices();

}

DodecahedronGeometry.prototype = Object.create( Geometry.prototype );
DodecahedronGeometry.prototype.constructor = DodecahedronGeometry;


export { DodecahedronGeometry };
