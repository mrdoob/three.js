/**
 * @author mrdoob / http://mrdoob.com/
 */

import { LineSegments } from '../objects/LineSegments.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Color } from '../math/Color.js';

function GridHelper( size, divisions, color1, color2 ) {

	size = size || 10;
	divisions = divisions || 10;
	color1 = new Color( color1 !== undefined ? color1 : 0x444444 );
	color2 = new Color( color2 !== undefined ? color2 : 0x888888 );

	const center = divisions / 2;
	const step = size / divisions;
	const halfSize = size / 2;

	const vertices = [], colors = [];

	for ( let i = 0, j = 0, k = - halfSize; i <= divisions; i ++, k += step ) {

		vertices.push( - halfSize, 0, k, halfSize, 0, k );
		vertices.push( k, 0, - halfSize, k, 0, halfSize );

		const color = i === center ? color1 : color2;

		color.toArray( colors, j ); j += 3;
		color.toArray( colors, j ); j += 3;
		color.toArray( colors, j ); j += 3;
		color.toArray( colors, j ); j += 3;

	}

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

	const material = new LineBasicMaterial( { vertexColors: true, toneMapped: false } );

	LineSegments.call( this, geometry, material );

	this.type = 'GridHelper';

}

GridHelper.prototype = Object.assign( Object.create( LineSegments.prototype ), {

	constructor: GridHelper,

	copy: function ( source ) {

		LineSegments.prototype.copy.call( this, source );

		this.geometry.copy( source.geometry );
		this.material.copy( source.material );

		return this;

	},

	clone: function () {

		return new this.constructor().copy( this );

	}

} );

export { GridHelper };
