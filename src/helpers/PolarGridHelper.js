import { LineSegments } from '../objects/LineSegments.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Color } from '../math/Color.js';

class PolarGridHelper extends LineSegments {

	constructor( radius = 10, radials = 16, circles = 8, divisions = 64, color1 = 0x444444, color2 = 0x888888 ) {

		color1 = new Color( color1 );
		color2 = new Color( color2 );

		const vertices = [];
		const colors = [];

		// create the radials

		for ( let i = 0; i <= radials; i ++ ) {

			const v = ( i / radials ) * ( Math.PI * 2 );

			const x = Math.sin( v ) * radius;
			const z = Math.cos( v ) * radius;

			vertices.push( 0, 0, 0 );
			vertices.push( x, 0, z );

			const color = ( i & 1 ) ? color1 : color2;

			colors.push( color.r, color.g, color.b );
			colors.push( color.r, color.g, color.b );

		}

		// create the circles

		for ( let i = 0; i <= circles; i ++ ) {

			const color = ( i & 1 ) ? color1 : color2;

			const r = radius - ( radius / circles * i );

			for ( let j = 0; j < divisions; j ++ ) {

				// first vertex

				let v = ( j / divisions ) * ( Math.PI * 2 );

				let x = Math.sin( v ) * r;
				let z = Math.cos( v ) * r;

				vertices.push( x, 0, z );
				colors.push( color.r, color.g, color.b );

				// second vertex

				v = ( ( j + 1 ) / divisions ) * ( Math.PI * 2 );

				x = Math.sin( v ) * r;
				z = Math.cos( v ) * r;

				vertices.push( x, 0, z );
				colors.push( color.r, color.g, color.b );

			}

		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		const material = new LineBasicMaterial( { vertexColors: true, toneMapped: false } );

		super( geometry, material );

		this.type = 'PolarGridHelper';

	}

}


export { PolarGridHelper };
