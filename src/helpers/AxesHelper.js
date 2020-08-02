import { LineSegments } from '../objects/LineSegments.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';

function AxesHelper( size ) {

	size = size || 1;

	const vertices = [
		0, 0, 0,	size, 0, 0,
		0, 0, 0,	0, size, 0,
		0, 0, 0,	0, 0, size
	];

	const colors = [
		1, 0, 0,	1, 0.6, 0,
		0, 1, 0,	0.6, 1, 0,
		0, 0, 1,	0, 0.6, 1
	];

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

	const material = new LineBasicMaterial( { vertexColors: true, toneMapped: false } );

	LineSegments.call( this, geometry, material );

	this.type = 'AxesHelper';

}

AxesHelper.prototype = Object.create( LineSegments.prototype );
AxesHelper.prototype.constructor = AxesHelper;


export { AxesHelper };
