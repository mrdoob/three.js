import { clamp } from '../../math/MathUtils.js';
import {
	vec2Create,
	vec2DistanceTo,
	vec2Normalize,
	vec2Sub
} from '../../math/Vector2Functions.js';
import {
	vec3ApplyMatrix4,
	vec3Copy,
	vec3Create,
	vec3CrossVectors,
	vec3DistanceTo,
	vec3Dot,
	vec3Length,
	vec3Normalize,
	vec3Set,
	vec3Sub
} from '../../math/Vector3Functions.js';
import { mat4Create, mat4MakeRotationAxis } from '../../math/Matrix4Functions.js';
import { warn } from '../../utils.js';

/**
 * An abstract base class for creating an analytic curve object that contains methods
 * for interpolation.
 *
 * @abstract
 */
class Curve {

	/**
	 * Constructs a new curve.
	 */
	constructor() {

		/**
		 * The type property is used for detecting the object type
		 * in context of serialization/deserialization.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.type = 'Curve';

		/**
		 * This value determines the amount of divisions when calculating the
		 * cumulative segment lengths of a curve via {@link Curve#getLengths}. To ensure
		 * precision when using methods like {@link Curve#getSpacedPoints}, it is
		 * recommended to increase the value of this property if the curve is very large.
		 *
		 * @type {number}
		 * @default 200
		 */
		this.arcLengthDivisions = 200;

		/**
		 * Must be set to `true` if the curve parameters have changed.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.needsUpdate = false;

		/**
		 * An internal cache that holds precomputed curve length values.
		 *
		 * @private
		 * @type {?Array<number>}
		 * @default null
		 */
		this.cacheArcLengths = null;

	}

	/**
	 * This method returns a vector in 2D or 3D space (depending on the curve definition)
	 * for the given interpolation factor.
	 *
	 * @abstract
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {(Vector2|Vector3)} [optionalTarget] - The optional target vector the result is written to.
	 * @return {(Vector2|Vector3)} The position on the curve. It can be a 2D or 3D vector depending on the curve definition.
	 */
	getPoint( /* t, optionalTarget */ ) {

		warn( 'Curve: .getPoint() not implemented.' );

	}

	/**
	 * This method returns a vector in 2D or 3D space (depending on the curve definition)
	 * for the given interpolation factor. Unlike {@link Curve#getPoint}, this method honors the length
	 * of the curve which equidistant samples.
	 *
	 * @param {number} u - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {(Vector2|Vector3)} [optionalTarget] - The optional target vector the result is written to.
	 * @return {(Vector2|Vector3)} The position on the curve. It can be a 2D or 3D vector depending on the curve definition.
	 */
	getPointAt( u, optionalTarget ) {

		const t = this.getUtoTmapping( u );
		return this.getPoint( t, optionalTarget );

	}

	/**
	 * This method samples the curve via {@link Curve#getPoint} and returns an array of points representing
	 * the curve shape.
	 *
	 * @param {number} [divisions=5] - The number of divisions.
	 * @return {Array<(Vector2|Vector3)>} An array holding the sampled curve values. The number of points is `divisions + 1`.
	 */
	getPoints( divisions = 5 ) {

		const points = [];

		for ( let d = 0; d <= divisions; d ++ ) {

			points.push( this.getPoint( d / divisions ) );

		}

		return points;

	}

	// Get sequence of points using getPointAt( u )

	/**
	 * This method samples the curve via {@link Curve#getPointAt} and returns an array of points representing
	 * the curve shape. Unlike {@link Curve#getPoints}, this method returns equi-spaced points across the entire
	 * curve.
	 *
	 * @param {number} [divisions=5] - The number of divisions.
	 * @return {Array<(Vector2|Vector3)>} An array holding the sampled curve values. The number of points is `divisions + 1`.
	 */
	getSpacedPoints( divisions = 5 ) {

		const points = [];

		for ( let d = 0; d <= divisions; d ++ ) {

			points.push( this.getPointAt( d / divisions ) );

		}

		return points;

	}

	/**
	 * Returns the total arc length of the curve.
	 *
	 * @return {number} The length of the curve.
	 */
	getLength() {

		const lengths = this.getLengths();
		return lengths[ lengths.length - 1 ];

	}

	/**
	 * Returns an array of cumulative segment lengths of the curve.
	 *
	 * @param {number} [divisions=this.arcLengthDivisions] - The number of divisions.
	 * @return {Array<number>} An array holding the cumulative segment lengths.
	 */
	getLengths( divisions = this.arcLengthDivisions ) {

		if ( this.cacheArcLengths &&
			( this.cacheArcLengths.length === divisions + 1 ) &&
			! this.needsUpdate ) {

			return this.cacheArcLengths;

		}

		this.needsUpdate = false;

		const cache = [];
		let current, last = this.getPoint( 0 );
		let sum = 0;

		cache.push( 0 );

		const distanceTo = ( last.z === undefined ) ? vec2DistanceTo : vec3DistanceTo;

		for ( let p = 1; p <= divisions; p ++ ) {

			current = this.getPoint( p / divisions );
			sum += distanceTo( current, last );
			cache.push( sum );
			last = current;

		}

		this.cacheArcLengths = cache;

		return cache; // { sums: cache, sum: sum }; Sum is in the last element.

	}

	/**
	 * Update the cumulative segment distance cache. The method must be called
	 * every time curve parameters are changed. If an updated curve is part of a
	 * composed curve like {@link CurvePath}, this method must be called on the
	 * composed curve, too.
	 */
	updateArcLengths() {

		this.needsUpdate = true;
		this.getLengths();

	}

	/**
	 * Given an interpolation factor in the range `[0,1]`, this method returns an updated
	 * interpolation factor in the same range that can be ued to sample equidistant points
	 * from a curve.
	 *
	 * @param {number} u - The interpolation factor.
	 * @param {?number} distance - An optional distance on the curve.
	 * @return {number} The updated interpolation factor.
	 */
	getUtoTmapping( u, distance = null ) {

		const arcLengths = this.getLengths();

		let i = 0;
		const il = arcLengths.length;

		let targetArcLength; // The targeted u distance value to get

		if ( distance ) {

			targetArcLength = distance;

		} else {

			targetArcLength = u * arcLengths[ il - 1 ];

		}

		// binary search for the index with largest value smaller than target u distance

		let low = 0, high = il - 1, comparison;

		while ( low <= high ) {

			i = Math.floor( low + ( high - low ) / 2 ); // less likely to overflow, though probably not issue here, JS doesn't really have integers, all numbers are floats

			comparison = arcLengths[ i ] - targetArcLength;

			if ( comparison < 0 ) {

				low = i + 1;

			} else if ( comparison > 0 ) {

				high = i - 1;

			} else {

				high = i;
				break;

				// DONE

			}

		}

		i = high;

		if ( arcLengths[ i ] === targetArcLength ) {

			return i / ( il - 1 );

		}

		// we could get finer grain at lengths, or use simple interpolation between two points

		const lengthBefore = arcLengths[ i ];
		const lengthAfter = arcLengths[ i + 1 ];

		const segmentLength = lengthAfter - lengthBefore;

		// determine where we are between the 'before' and 'after' points

		const segmentFraction = ( targetArcLength - lengthBefore ) / segmentLength;

		// add that fractional amount to t

		const t = ( i + segmentFraction ) / ( il - 1 );

		return t;

	}

	/**
	 * Returns a unit vector tangent for the given interpolation factor.
	 * If the derived curve does not implement its tangent derivation,
	 * two points a small delta apart will be used to find its gradient
	 * which seems to give a reasonable approximation.
	 *
	 * @param {number} t - The interpolation factor.
	 * @param {(Vector2|Vector3)} [optionalTarget] - The optional target vector the result is written to.
	 * @return {(Vector2|Vector3)} The tangent vector.
	 */
	getTangent( t, optionalTarget ) {

		const delta = 0.0001;
		let t1 = t - delta;
		let t2 = t + delta;

		// Capping in case of danger

		if ( t1 < 0 ) t1 = 0;
		if ( t2 > 1 ) t2 = 1;

		const pt1 = this.getPoint( t1 );
		const pt2 = this.getPoint( t2 );

		const is2D = pt1.z === undefined;
		const tangent = optionalTarget || ( is2D ? vec2Create() : vec3Create() );

		if ( is2D ) {

			vec2Sub( pt2, pt1, tangent );
			vec2Normalize( tangent, tangent );

		} else {

			vec3Sub( pt2, pt1, tangent );
			vec3Normalize( tangent, tangent );

		}

		return tangent;

	}

	/**
	 * Same as {@link Curve#getTangent} but with equidistant samples.
	 *
	 * @param {number} u - The interpolation factor.
	 * @param {(Vector2|Vector3)} [optionalTarget] - The optional target vector the result is written to.
	 * @return {(Vector2|Vector3)} The tangent vector.
	 * @see {@link Curve#getPointAt}
	 */
	getTangentAt( u, optionalTarget ) {

		const t = this.getUtoTmapping( u );
		return this.getTangent( t, optionalTarget );

	}

	/**
	 * Generates the Frenet Frames. Requires a curve definition in 3D space. Used
	 * in geometries like {@link TubeGeometry} or {@link ExtrudeGeometry}.
	 *
	 * @param {number} segments - The number of segments.
	 * @param {boolean} [closed=false] - Whether the curve is closed or not.
	 * @return {{tangents: Array<Vector3>, normals: Array<Vector3>, binormals: Array<Vector3>}} The Frenet Frames.
	 */
	computeFrenetFrames( segments, closed = false ) {

		// see http://www.cs.indiana.edu/pub/techreports/TR425.pdf

		const normal = vec3Create();

		const tangents = [];
		const normals = [];
		const binormals = [];

		const vec = vec3Create();
		const mat = mat4Create();

		// compute the tangent vectors for each segment on the curve

		for ( let i = 0; i <= segments; i ++ ) {

			const u = i / segments;

			tangents[ i ] = this.getTangentAt( u, vec3Create() );

		}

		// select an initial normal vector perpendicular to the first tangent vector,
		// and in the direction of the minimum tangent xyz component

		normals[ 0 ] = vec3Create();
		binormals[ 0 ] = vec3Create();
		let min = Number.MAX_VALUE;
		const tx = Math.abs( tangents[ 0 ].x );
		const ty = Math.abs( tangents[ 0 ].y );
		const tz = Math.abs( tangents[ 0 ].z );

		if ( tx <= min ) {

			min = tx;
			vec3Set( normal, 1, 0, 0 );

		}

		if ( ty <= min ) {

			min = ty;
			vec3Set( normal, 0, 1, 0 );

		}

		if ( tz <= min ) {

			vec3Set( normal, 0, 0, 1 );

		}

		vec3CrossVectors( tangents[ 0 ], normal, vec );
		vec3Normalize( vec, vec );

		vec3CrossVectors( tangents[ 0 ], vec, normals[ 0 ] );
		vec3CrossVectors( tangents[ 0 ], normals[ 0 ], binormals[ 0 ] );


		// compute the slowly-varying normal and binormal vectors for each segment on the curve

		for ( let i = 1; i <= segments; i ++ ) {

			normals[ i ] = vec3Copy( normals[ i - 1 ] );

			binormals[ i ] = vec3Copy( binormals[ i - 1 ] );

			vec3CrossVectors( tangents[ i - 1 ], tangents[ i ], vec );

			if ( vec3Length( vec ) > Number.EPSILON ) {

				vec3Normalize( vec, vec );

				const theta = Math.acos( clamp( vec3Dot( tangents[ i - 1 ], tangents[ i ] ), - 1, 1 ) ); // clamp for floating pt errors

				mat4MakeRotationAxis( vec, theta, mat );
				vec3ApplyMatrix4( normals[ i ], mat, normals[ i ] );

			}

			vec3CrossVectors( tangents[ i ], normals[ i ], binormals[ i ] );

		}

		// if the curve is closed, postprocess the vectors so the first and last normal vectors are the same

		if ( closed === true ) {

			let theta = Math.acos( clamp( vec3Dot( normals[ 0 ], normals[ segments ] ), - 1, 1 ) );
			theta /= segments;

			if ( vec3Dot( tangents[ 0 ], vec3CrossVectors( normals[ 0 ], normals[ segments ], vec ) ) > 0 ) {

				theta = - theta;

			}

			for ( let i = 1; i <= segments; i ++ ) {

				// twist a little...
				mat4MakeRotationAxis( tangents[ i ], theta * i, mat );
				vec3ApplyMatrix4( normals[ i ], mat, normals[ i ] );
				vec3CrossVectors( tangents[ i ], normals[ i ], binormals[ i ] );

			}

		}

		return {
			tangents: tangents,
			normals: normals,
			binormals: binormals
		};

	}

	/**
	 * Returns a new curve with copied values from this instance.
	 *
	 * @return {Curve} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Copies the values of the given curve to this instance.
	 *
	 * @param {Curve} source - The curve to copy.
	 * @return {Curve} A reference to this curve.
	 */
	copy( source ) {

		this.arcLengthDivisions = source.arcLengthDivisions;

		return this;

	}

	/**
	 * Serializes the curve into JSON.
	 *
	 * @return {Object} A JSON object representing the serialized curve.
	 * @see {@link ObjectLoader#parse}
	 */
	toJSON() {

		const data = {
			metadata: {
				version: 4.7,
				type: 'Curve',
				generator: 'Curve.toJSON'
			}
		};

		data.arcLengthDivisions = this.arcLengthDivisions;
		data.type = this.type;

		return data;

	}

	/**
	 * Deserializes the curve from the given JSON.
	 *
	 * @param {Object} json - The JSON holding the serialized curve.
	 * @return {Curve} A reference to this curve.
	 */
	fromJSON( json ) {

		this.arcLengthDivisions = json.arcLengthDivisions;

		return this;

	}

}


export { Curve };
