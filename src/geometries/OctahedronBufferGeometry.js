import { PolyhedronBufferGeometry } from './PolyhedronBufferGeometry';

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

function OctahedronBufferGeometry( radius,detail ) {

	var vertices = [
		1, 0, 0,   - 1, 0, 0,    0, 1, 0,    0, - 1, 0,    0, 0, 1,    0, 0, - 1
	];

	var indices = [
		0, 2, 4,    0, 4, 3,    0, 3, 5,    0, 5, 2,    1, 2, 5,    1, 5, 3,    1, 3, 4,    1, 4, 2
	];

	PolyhedronBufferGeometry.call( this, vertices, indices, radius, detail );

	this.type = 'OctahedronBufferGeometry';

	this.parameters = {
		radius: radius,
		detail: detail
	};

}

OctahedronBufferGeometry.prototype = Object.create( PolyhedronBufferGeometry.prototype );
OctahedronBufferGeometry.prototype.constructor = OctahedronBufferGeometry;


export { OctahedronBufferGeometry };
