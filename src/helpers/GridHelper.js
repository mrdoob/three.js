/**
 * @author mrdoob / http://mrdoob.com/
 */

import { LineSegments } from '../objects/LineSegments.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Color } from '../math/Color.js';


class GridHelper extends LineSegments {

	constructor( size, divisions, color1, color2 ) {

		size = size || 10;
		divisions = divisions || 10;
		color1 = new Color( color1 !== undefined ? color1 : 0x444444 );
		color2 = new Color( color2 !== undefined ? color2 : 0x888888 );

		var center = divisions / 2;
		var step = size / divisions;
		var halfSize = size / 2;

		var vertices = [], colors = [];

		for ( var i = 0, j = 0, k = - halfSize; i <= divisions; i ++, k += step ) {

			vertices.push( - halfSize, 0, k, halfSize, 0, k );
			vertices.push( k, 0, - halfSize, k, 0, halfSize );

			var color = i === center ? color1 : color2;

			color.toArray( colors, j ); j += 3;
			color.toArray( colors, j ); j += 3;
			color.toArray( colors, j ); j += 3;
			color.toArray( colors, j ); j += 3;

		}

		var geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		var material = new LineBasicMaterial( { vertexColors: true, toneMapped: false } );

		super( geometry, material );
		this.size = size;
		this.divisions = divisions;
		this.color1 = color1;
		this.color2 = color2;

	}

	copy( source ) {

		super.copy( source );

		this.geometry.copy( source.geometry );
		this.material.copy( source.material );

		return this;

	}

	clone() {

		return new GridHelper( this.size, this.divisions, this.color1, this.color2 );

	}

}


export { GridHelper };
