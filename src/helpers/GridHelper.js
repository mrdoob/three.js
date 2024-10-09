import { LineSegments } from '../objects/LineSegments.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Color } from '../math/Color.js';

class GridHelper extends LineSegments {

	constructor( size = 10, divisions = 10, color1 = 0x444444, color2 = 0x888888 ) {

		color1 = new Color( color1 );
		color2 = new Color( color2 );

		let sizeX, sizeZ;
		if ( Array.isArray( size ) ) {

			sizeX = size[ 0 ];
			sizeZ = size[ 1 ];

		} else {

			sizeX = size;
			sizeZ = size;

		}

		let divisionsX, divisionsZ;
		if ( Array.isArray( divisions ) ) {

			divisionsX = divisions[ 0 ];
			divisionsZ = divisions[ 1 ];

		} else {

			divisionsX = divisions;
			divisionsZ = divisions;

		}

		const centerX = divisionsX / 2;
		const centerZ = divisionsZ / 2;

		const stepX = sizeX / divisionsX;
		const stepZ = sizeZ / divisionsZ;

		const halfSizeX = sizeX / 2;
		const halfSizeZ = sizeZ / 2;

		const vertices = [], colors = [];

		for ( let i = 0, k = - halfSizeZ; i <= divisionsZ; i ++, k += stepZ ) {

			vertices.push( - halfSizeX, 0, k, halfSizeX, 0, k );

			const color = ( i === centerZ ) ? color1 : color2;

			color.toArray( colors, colors.length );
			color.toArray( colors, colors.length );

		}

		for ( let i = 0, k = - halfSizeX; i <= divisionsX; i ++, k += stepX ) {

			vertices.push( k, 0, - halfSizeZ, k, 0, halfSizeZ );

			const color = ( i === centerX ) ? color1 : color2;

			color.toArray( colors, colors.length );
			color.toArray( colors, colors.length );

		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		const material = new LineBasicMaterial( { vertexColors: true, toneMapped: false } );

		super( geometry, material );

		this.type = 'GridHelper';

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}


export { GridHelper };
