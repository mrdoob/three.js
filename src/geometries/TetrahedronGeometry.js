/**
 * @author timothypratley / https://github.com/timothypratley
 */

import { Geometry } from '../core/Geometry';

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

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { PolyhedronBufferGeometry } from './PolyhedronGeometry';

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

export { TetrahedronGeometry, TetrahedronBufferGeometry };
