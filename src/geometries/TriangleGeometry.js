import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';

class TriangleGeometry extends BufferGeometry {

	constructor( width = 1, height = 1, skew = 0, detail = 0 ) {

		super();

		this.type = 'TriangleGeometry';

		this.parameters = {
			width: width,
			height: height,
			skew: skew,
			detail: detail
		};

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// vertex helper variables

		const segments = Math.max( Math.floor( detail + 1 ), 1 );

		const equilateralHeight = Math.sqrt( 3 ) / 2;
		const apex = equilateralHeight * height;

		const offsetX = width / 2;
		const offsetY = apex / 3;
		const offsetU = ( 1 - equilateralHeight ) / 2;

		// vertices, normals, and uvs

		for ( let i = 0; i < segments + 1; i ++ ) {

			for ( let j = 0; j < i + 1; j ++ ) {

				const uvX = ( i + j ) / segments / 2;
				const uvY = ( i - j ) / segments;

				const x = uvX * width - offsetX + uvY * skew / 2;
				const y = uvY * apex - offsetY;

				vertices.push( x, y, 0 );

				normals.push( 0, 0, 1 );

				uvs.push( uvX );
				uvs.push( uvY * equilateralHeight + offsetU );

			}

		}

		// index helper variables

		let lateralStride = 2;
		let diagonalStride = 1;

		// indices

		for ( let i = 0; i < segments; i ++ ) {

			for ( let j = 0; j < i + 1; j ++ ) {

				const a = i * ( i + 1 ) / 2 + j;
				const b = i + lateralStride;
				const c = i + diagonalStride;
				const d = a + 1;
				
				indices.push( a, b, c );

				if ( 0 < i && j < i ) {

					indices.push( a, d, b );

				}

				lateralStride ++;
				diagonalStride ++;

			}

		}

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	static fromJSON( data ) {

		return new TriangleGeometry( data.width, data.height, data.skew );

	}

}

export { TriangleGeometry };
