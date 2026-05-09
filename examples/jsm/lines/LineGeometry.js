import { LineSegmentsGeometry } from './LineSegmentsGeometry.js';

/**
 * A chain of vertices, forming a polyline.
 *
 * This is used in {@link Line2} to describe the shape.
 *
 * ```js
 * const points = [
 * 	new THREE.Vector3( - 10, 0, 0 ),
 * 	new THREE.Vector3( 0, 5, 0 ),
 * 	new THREE.Vector3( 10, 0, 0 ),
 * ];
 *
 * const geometry = new LineGeometry();
 * geometry.setFromPoints( points );
 * ```
 *
 * @augments LineSegmentsGeometry
 * @three_import import { LineLineGeometry2 } from 'three/addons/lines/LineGeometry.js';
 */
class LineGeometry extends LineSegmentsGeometry {

	/**
	 * Constructs a new line geometry.
	 */
	constructor() {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLineGeometry = true;

		this.type = 'LineGeometry';

	}

	/**
	 * Sets the given line positions for this geometry.
	 *
	 * @param {Float32Array|Array<number>} array - The position data to set.
	 * @return {LineGeometry} A reference to this geometry.
	 */
	setPositions( array ) {

		// converts [ x1, y1, z1,  x2, y2, z2, ... ] to pairs format

		const length = array.length - 3;
		const points = new Float32Array( 2 * length );

		for ( let i = 0; i < length; i += 3 ) {

			points[ 2 * i ] = array[ i ];
			points[ 2 * i + 1 ] = array[ i + 1 ];
			points[ 2 * i + 2 ] = array[ i + 2 ];

			points[ 2 * i + 3 ] = array[ i + 3 ];
			points[ 2 * i + 4 ] = array[ i + 4 ];
			points[ 2 * i + 5 ] = array[ i + 5 ];

		}

		super.setPositions( points );

		return this;

	}

	/**
	 * Sets the given line colors for this geometry.
	 *
	 * @param {Float32Array|Array<number>} array - The position data to set.
	 * @return {LineGeometry} A reference to this geometry.
	 */
	setColors( array ) {

		// converts [ r1, g1, b1,  r2, g2, b2, ... ] to pairs format

		const length = array.length - 3;
		const colors = new Float32Array( 2 * length );

		for ( let i = 0; i < length; i += 3 ) {

			colors[ 2 * i ] = array[ i ];
			colors[ 2 * i + 1 ] = array[ i + 1 ];
			colors[ 2 * i + 2 ] = array[ i + 2 ];

			colors[ 2 * i + 3 ] = array[ i + 3 ];
			colors[ 2 * i + 4 ] = array[ i + 4 ];
			colors[ 2 * i + 5 ] = array[ i + 5 ];

		}

		super.setColors( colors );

		return this;

	}

	/**
	 * Setups this line segments geometry from the given sequence of points.
	 *
	 * @param {Array<Vector3|Vector2>} points - An array of points in 2D or 3D space.
	 * @return {LineGeometry} A reference to this geometry.
	 */
	setFromPoints( points ) {

		// converts a vector3 or vector2 array to pairs format

		const length = points.length - 1;
		const positions = new Float32Array( 6 * length );

		for ( let i = 0; i < length; i ++ ) {

			positions[ 6 * i ] = points[ i ].x;
			positions[ 6 * i + 1 ] = points[ i ].y;
			positions[ 6 * i + 2 ] = points[ i ].z || 0;

			positions[ 6 * i + 3 ] = points[ i + 1 ].x;
			positions[ 6 * i + 4 ] = points[ i + 1 ].y;
			positions[ 6 * i + 5 ] = points[ i + 1 ].z || 0;

		}

		super.setPositions( positions );

		return this;

	}

	/**
	 * Setups this line segments geometry from the given line.
	 *
	 * @param {Line} line - The line that should be used as a data source for this geometry.
	 * @return {LineGeometry} A reference to this geometry.
	 */
	fromLine( line ) {

		const geometry = line.geometry;

		this.setPositions( geometry.attributes.position.array ); // assumes non-indexed

		// set colors, maybe

		return this;

	}

}

export { LineGeometry };
