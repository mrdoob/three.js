import { Geometry } from '../core/Geometry';
import { PolyhedronBufferGeometry } from './PolyhedronBufferGeometry';

/**
 * @author clockworkgeek / https://github.com/clockworkgeek
 * @author timothypratley / https://github.com/timothypratley
 * @author WestLangley / http://github.com/WestLangley
*/

function PolyhedronGeometry( vertices, indices, radius, detail ) {

	Geometry.call( this );

	this.type = 'PolyhedronGeometry';

	this.parameters = {
		vertices: vertices,
		indices: indices,
		radius: radius,
		detail: detail
	};

	this.fromBufferGeometry( new PolyhedronBufferGeometry( vertices, indices, radius, detail ) );
	this.mergeVertices();

}

PolyhedronGeometry.prototype = Object.create( Geometry.prototype );
PolyhedronGeometry.prototype.constructor = PolyhedronGeometry;


export { PolyhedronGeometry };
