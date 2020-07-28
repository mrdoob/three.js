import { Geometry } from '../core/Geometry.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';

// PlaneGeometry

function PlaneGeometry( width, height, widthSegments, heightSegments ) {

	Geometry.call( this );

	this.type = 'PlaneGeometry';

	this.parameters = {
		width: width,
		height: height,
		widthSegments: widthSegments,
		heightSegments: heightSegments
	};

	this.fromBufferGeometry( new PlaneBufferGeometry( width, height, widthSegments, heightSegments ) );
	this.mergeVertices();

}

PlaneGeometry.prototype = Object.create( Geometry.prototype );
PlaneGeometry.prototype.constructor = PlaneGeometry;

// PlaneBufferGeometry

function PlaneBufferGeometry( width, height, widthSegments, heightSegments ) {

	BufferGeometry.call( this );

	this.type = 'PlaneBufferGeometry';

	this.parameters = {
		width: width,
		height: height,
		widthSegments: widthSegments,
		heightSegments: heightSegments
	};

	width = width || 1;
	height = height || 1;

	const width_half = width / 2;
	const height_half = height / 2;

	const gridX = Math.floor( widthSegments ) || 1;
	const gridY = Math.floor( heightSegments ) || 1;

	const gridX1 = gridX + 1;
	const gridY1 = gridY + 1;

	const segment_width = width / gridX;
	const segment_height = height / gridY;

	// buffers

	const indices = [];
	const vertices = [];
	const normals = [];
	const uvs = [];

	// generate vertices, normals and uvs

	for ( let iy = 0; iy < gridY1; iy ++ ) {

		const y = iy * segment_height - height_half;

		for ( let ix = 0; ix < gridX1; ix ++ ) {

			const x = ix * segment_width - width_half;

			vertices.push( x, - y, 0 );

			normals.push( 0, 0, 1 );

			uvs.push( ix / gridX );
			uvs.push( 1 - ( iy / gridY ) );

		}

	}

	// indices

	for ( let iy = 0; iy < gridY; iy ++ ) {

		for ( let ix = 0; ix < gridX; ix ++ ) {

			const a = ix + gridX1 * iy;
			const b = ix + gridX1 * ( iy + 1 );
			const c = ( ix + 1 ) + gridX1 * ( iy + 1 );
			const d = ( ix + 1 ) + gridX1 * iy;

			// faces

			indices.push( a, b, d );
			indices.push( b, c, d );

		}

	}

	// build geometry

	this.setIndex( indices );
	this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
	this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

}

PlaneBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
PlaneBufferGeometry.prototype.constructor = PlaneBufferGeometry;


export { PlaneGeometry, PlaneBufferGeometry };
