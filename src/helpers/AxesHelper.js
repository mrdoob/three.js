/**
 * @author sroucheray / http://sroucheray.org/
 * @author mrdoob / http://mrdoob.com/
 */

import { LineSegments } from '../objects/LineSegments.js';
import { VertexColors } from '../constants.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';

function AxesHelper( size ) {

	size = size || 1;

	var vertices = [
		0, 0, 0,	size, 0, 0,
		0, 0, 0,	0, size, 0,
		0, 0, 0,	0, 0, size
	];

	var colors = [
		1, 0, 0,	1, 0.6, 0,
		0, 1, 0,	0.6, 1, 0,
		0, 0, 1,	0, 0.6, 1
	];

	var geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

	var material = new LineBasicMaterial( { vertexColors: VertexColors } );

	LineSegments.call( this, geometry, material );

}

AxesHelper.prototype = Object.create( LineSegments.prototype );
AxesHelper.prototype.constructor = AxesHelper;


export { AxesHelper };
