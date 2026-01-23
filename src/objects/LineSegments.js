import { Line } from './Line.js';
import { Vector3 } from '../math/Vector3.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { warn } from '../utils.js';

const _start = /*@__PURE__*/ new Vector3();
const _end = /*@__PURE__*/ new Vector3();

/**
 * A series of lines drawn between pairs of vertices.
 *
 * @augments Line
 */
class LineSegments extends Line {

	/**
	 * Constructs a new line segments.
	 *
	 * @param {BufferGeometry} [geometry] - The line geometry.
	 * @param {Material|Array<Material>} [material] - The line material.
	 */
	constructor( geometry, material ) {

		super( geometry, material );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLineSegments = true;

		this.type = 'LineSegments';

	}

	computeLineDistances() {

		const geometry = this.geometry;

		// we assume non-indexed geometry

		if ( geometry.index === null ) {

			const positionAttribute = geometry.attributes.position;
			const lineDistances = [];

			for ( let i = 0, l = positionAttribute.count; i < l; i += 2 ) {

				_start.fromBufferAttribute( positionAttribute, i );
				_end.fromBufferAttribute( positionAttribute, i + 1 );

				lineDistances[ i ] = ( i === 0 ) ? 0 : lineDistances[ i - 1 ];
				lineDistances[ i + 1 ] = lineDistances[ i ] + _start.distanceTo( _end );

			}

			geometry.setAttribute( 'lineDistance', new Float32BufferAttribute( lineDistances, 1 ) );

		} else {

			warn( 'LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.' );

		}

		return this;

	}

}

export { LineSegments };
