/**
 * @author timothypratley / https://github.com/timothypratley
 */

import { Geometry } from '../core/Geometry';

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

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { PolyhedronBufferGeometry } from './PolyhedronGeometry';

function OctahedronBufferGeometry( radius, detail ) {

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

export { OctahedronGeometry, OctahedronBufferGeometry };
