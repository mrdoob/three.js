import {
	vec2Add,
	vec2Copy,
	vec2Create,
	vec2FromArray,
	vec2MultiplyScalar,
	vec2Normalize,
	vec2Sub,
	vec2SubVectors,
	vec2ToArray
} from '../../math/Vector2Functions.js';
import { Curve } from '../core/Curve.js';

/**
 * A curve representing a 2D line segment.
 *
 * @augments Curve
 */
class LineCurve extends Curve {

	/**
	 * Constructs a new line curve.
	 *
	 * @param {Vector2} [v1] - The start point.
	 * @param {Vector2} [v2] - The end point.
	 */
	constructor( v1 = vec2Create(), v2 = vec2Create() ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLineCurve = true;

		this.type = 'LineCurve';

		/**
		 * The start point.
		 *
		 * @type {Vector2}
		 */
		this.v1 = v1;

		/**
		 * The end point.
		 *
		 * @type {Vector2}
		 */
		this.v2 = v2;

	}

	/**
	 * Returns a point on the line.
	 *
	 * @param {number} t - A interpolation factor representing a position on the line. Must be in the range `[0,1]`.
	 * @param {Vector2} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector2} The position on the line.
	 */
	getPoint( t, optionalTarget = vec2Create() ) {

		const point = optionalTarget;

		if ( t === 1 ) {

			vec2Copy( this.v2, point );

		} else {

			vec2Sub( this.v2, this.v1, point );
			vec2MultiplyScalar( point, t, point );
			vec2Add( point, this.v1, point );

		}

		return point;

	}

	// Line curve is linear, so we can overwrite default getPointAt
	getPointAt( u, optionalTarget ) {

		return this.getPoint( u, optionalTarget );

	}

	getTangent( t, optionalTarget = vec2Create() ) {

		vec2SubVectors( this.v2, this.v1, optionalTarget );
		return vec2Normalize( optionalTarget, optionalTarget );

	}

	getTangentAt( u, optionalTarget ) {

		return this.getTangent( u, optionalTarget );

	}

	copy( source ) {

		super.copy( source );

		vec2Copy( source.v1, this.v1 );
		vec2Copy( source.v2, this.v2 );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.v1 = vec2ToArray( this.v1 );
		data.v2 = vec2ToArray( this.v2 );

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		vec2FromArray( json.v1, 0, this.v1 );
		vec2FromArray( json.v2, 0, this.v2 );

		return this;

	}

}

export { LineCurve };
