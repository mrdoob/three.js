import { PolyhedronBufferGeometry } from './PolyhedronBufferGeometry';

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

function TetrahedronBufferGeometry( radius, detail ) {

	var vertices = [
		1,  1,  1,   - 1, - 1,  1,   - 1,  1, - 1,    1, - 1, - 1
	];

	var indices = [
		2,  1,  0,    0,  3,  2,    1,  3,  0,    2,  3,  1
	];

	PolyhedronBufferGeometry.call( this, vertices, indices, radius, detail );

	this.type = 'TetrahedronBufferGeometry';

	this.parameters = {
		radius: radius,
		detail: detail
	};

}

TetrahedronBufferGeometry.prototype = Object.create( PolyhedronBufferGeometry.prototype );
TetrahedronBufferGeometry.prototype.constructor = TetrahedronBufferGeometry;


export { TetrahedronBufferGeometry };
