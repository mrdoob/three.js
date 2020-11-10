/**
 * Parametric Surfaces Geometry
 * based on the brilliant article by @prideout https://prideout.net/blog/old/blog/index.html@p=44.html
 */

import { Geometry } from '../core/Geometry.js';
import { ParametricBufferGeometry } from './ParametricBufferGeometry.js';

function ParametricGeometry( func, slices, stacks ) {

	Geometry.call( this );

	this.type = 'ParametricGeometry';

	this.parameters = {
		func: func,
		slices: slices,
		stacks: stacks
	};

	this.fromBufferGeometry( new ParametricBufferGeometry( func, slices, stacks ) );
	this.mergeVertices();

}

ParametricGeometry.prototype = Object.create( Geometry.prototype );
ParametricGeometry.prototype.constructor = ParametricGeometry;


export { ParametricGeometry };
