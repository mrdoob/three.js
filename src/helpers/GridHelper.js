import { LineSegments } from '../objects/LineSegments.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Color } from '../math/Color.js';

class GridHelper extends LineSegments {

	constructor( size = 10, divisions = 10, color1 = 0x444444, color2 = 0x888888 ) {

		color1 = new Color( color1 );
		color2 = new Color( color2 );

		const [ width, depth ] = Array.isArray( size ) ? size : [ size, size ];
		const [ divisionsX, divisionsZ ] = Array.isArray( divisions ) ? divisions : [ divisions, divisions ];

		const stepX = width / divisionsX;
		const stepZ = depth / divisionsZ;
		const halfWidth = width / 2;
		const halfDepth = depth / 2;

		const vertices = [], colors = [];

		for ( let i = 0; i <= divisionsZ; i ++ ) {

			const k = - halfDepth + i * stepZ;
			vertices.push( - halfWidth, 0, k, halfWidth, 0, k );

			const color = ( i === divisionsZ / 2 ) ? color1 : color2;
			color.toArray( colors, colors.length );
			color.toArray( colors, colors.length );

		}

		for ( let i = 0; i <= divisionsX; i ++ ) {

			const k = - halfWidth + i * stepX;
			vertices.push( k, 0, - halfDepth, k, 0, halfDepth );

			const color = ( i === divisionsX / 2 ) ? color1 : color2;
			color.toArray( colors, colors.length );
			color.toArray( colors, colors.length );

		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		super( geometry, new LineBasicMaterial( { vertexColors: true, toneMapped: false } ) );

		this.type = 'GridHelper';

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

export { GridHelper };
