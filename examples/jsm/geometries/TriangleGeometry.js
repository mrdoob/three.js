import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';

class TriangleGeometry extends BufferGeometry {

	constructor( width = 1, height = Math.sqrt( 3 ) / 2, skew = 0, segments = 1 ) {

		super();

		this.type = 'TriangleGeometry';

		segments = Math.max( Math.floor( segments ), 1 );

		this.parameters = {
			width: width,
			height: height,
			skew: skew,
			segments: segments
		};

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// vertex helper variables

		const widthHalf = width / 2;
		const skewHalf = skew / 2;

		const offsetX = ( width + widthHalf + skewHalf ) / 3;
		const offsetY = height / 3;

		const length = Math.max( Math.abs( skewHalf ) + widthHalf, width );

		const maxU = Math.min( length / height, 1);
		const maxV = Math.min( height / length, 1);

		const offsetU = skew + width > 0 ? ( 1 - maxU ) / 2 : ( length - width ) / length;
		const offsetV = ( 1 - maxV ) / 2;

		// vertices, normals, and uvs

		for ( let i = 0; i < segments + 1; i ++ ) {

			for ( let j = 0; j < i + 1; j ++ ) {

				const normX = ( i + j ) / segments / 2;
				const normY = ( i - j ) / segments;

				const x = normX * width + normY * skewHalf;
				const y = normY * height;

				const u = maxU * x / length;
				const v = maxV * y / height;

				vertices.push( x - offsetX, y - offsetY, 0 );

				normals.push( 0, 0, 1 );

				uvs.push( u + offsetU, v + offsetV );

			}

		}


		// indices

		let stride = 1;

		for ( let i = 0; i < segments; i ++ ) {

			for ( let j = 0; j < i + 1; j ++ ) {

				const a = i * ( i + 1 ) / 2 + j;
				const b = i + stride + 1;

				indices.push( a, b, i + stride );

				if ( 0 < i && j < i ) {

					indices.push( a, a + 1, b );

				}

				stride ++;

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

		return new TriangleGeometry( data.width, data.height, data.skew, data.segments );

	}

}

export { TriangleGeometry };
