import { LineSegmentsGeometry } from '../lines/LineSegmentsGeometry.js';

class LineGeometry extends LineSegmentsGeometry {

	constructor() {

		super();

		this.isLineGeometry = true;

		this.type = 'LineGeometry';

	}

	setPositions( array ) {

		// converts [ x1, y1, z1,  x2, y2, z2, ... ] to pairs format
		const count = array.length / 3 - 1;
		const points = new Float32Array( 6 * count );

		for ( let i = 0; i < count; i ++ ) {

			points[ 6 * i ] = array[ 3 * i ];
			points[ 6 * i + 1 ] = array[ 3 * i + 1 ];
			points[ 6 * i + 2 ] = array[ 3 * i + 2 ];

			points[ 6 * i + 3 ] = array[ 3 * ( i + 1 ) ];
			points[ 6 * i + 4 ] = array[ 3 * ( i + 1 ) + 1 ];
			points[ 6 * i + 5 ] = array[ 3 * ( i + 1 ) + 2 ];

		}

		super.setPositions( points );

		return this;

	}

	setColors( array ) {

		// converts [ r1, g1, b1,  r2, g2, b2, ... ] to pairs format
		const count = array.length / 3 - 1;
		const colors = new Float32Array( 6 * count );

		for ( let i = 0; i < count; i ++ ) {

			colors[ 6 * i ] = array[ 3 * i ];
			colors[ 6 * i + 1 ] = array[ 3 * i + 1 ];
			colors[ 6 * i + 2 ] = array[ 3 * i + 2 ];

			colors[ 6 * i + 3 ] = array[ 3 * ( i + 1 ) ];
			colors[ 6 * i + 4 ] = array[ 3 * ( i + 1 ) + 1 ];
			colors[ 6 * i + 5 ] = array[ 3 * ( i + 1 ) + 2 ];

		}

		super.setColors( colors );

		return this;

	}

	setFromPoints( points ) {

		// converts a vector3 or vector2 array to pairs format

		const count = points.length - 1;
		const positions = new Float32Array( 6 * count );

		for ( let i = 0; i < count; i ++ ) {

			const start = points[ i ];
			const end = points[ i + 1 ];

			positions[ 6 * i ] = start.x;
			positions[ 6 * i + 1 ] = start.y;
			positions[ 6 * i + 2 ] = start.z || 0;

			positions[ 6 * i + 3 ] = end.x;
			positions[ 6 * i + 4 ] = end.y;
			positions[ 6 * i + 5 ] = end.z || 0;

		}

		super.setPositions( positions );

		return this;

	}

	fromLine( line ) {

		const geometry = line.geometry;

		this.setPositions( geometry.attributes.position.array ); // assumes non-indexed

		// set colors, maybe

		return this;

	}

}

export { LineGeometry };
