import { Line } from './Line.js';
import { vec3Create, vec3FromBufferAttribute, vec3DistanceTo } from '../math/Vector3Functions.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { warn } from '../utils.js';

const _start = /*@__PURE__*/ vec3Create();
const _end = /*@__PURE__*/ vec3Create();

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

				vec3FromBufferAttribute( positionAttribute, i, _start );
				vec3FromBufferAttribute( positionAttribute, i + 1, _end );

				lineDistances[ i ] = ( i === 0 ) ? 0 : lineDistances[ i - 1 ];
				lineDistances[ i + 1 ] = lineDistances[ i ] + vec3DistanceTo( _start, _end );

			}

			geometry.setAttribute( 'lineDistance', new Float32BufferAttribute( lineDistances, 1 ) );

		} else {

			warn( 'LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.' );

		}

		return this;

	}

}

export { LineSegments };
