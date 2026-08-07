import {
	vec3Add,
	vec3Copy,
	vec3Create,
	vec3FromArray,
	vec3MultiplyScalar,
	vec3Normalize,
	vec3Sub,
	vec3SubVectors,
	vec3ToArray
} from '../../math/Vector3Functions.js';
import { Curve } from '../core/Curve.js';

/**
 * A curve representing a 3D line segment.
 *
 * @augments Curve
 */
class LineCurve3 extends Curve {

	/**
	 * Constructs a new line curve.
	 *
	 * @param {Vector3} [v1] - The start point.
	 * @param {Vector3} [v2] - The end point.
	 */
	constructor( v1 = vec3Create(), v2 = vec3Create() ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLineCurve3 = true;

		this.type = 'LineCurve3';

		/**
		 * The start point.
		 *
		 * @type {Vector3}
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
	 * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector3} The position on the line.
	 */
	getPoint( t, optionalTarget = vec3Create() ) {

		const point = optionalTarget;

		if ( t === 1 ) {

			vec3Copy( this.v2, point );

		} else {

			vec3Sub( this.v2, this.v1, point );
			vec3MultiplyScalar( point, t, point );
			vec3Add( point, this.v1, point );

		}

		return point;

	}

	// Line curve is linear, so we can overwrite default getPointAt
	getPointAt( u, optionalTarget ) {

		return this.getPoint( u, optionalTarget );

	}

	getTangent( t, optionalTarget = vec3Create() ) {

		vec3SubVectors( this.v2, this.v1, optionalTarget );
		return vec3Normalize( optionalTarget, optionalTarget );

	}

	getTangentAt( u, optionalTarget ) {

		return this.getTangent( u, optionalTarget );

	}

	copy( source ) {

		super.copy( source );

		vec3Copy( source.v1, this.v1 );
		vec3Copy( source.v2, this.v2 );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.v1 = vec3ToArray( this.v1 );
		data.v2 = vec3ToArray( this.v2 );

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		vec3FromArray( json.v1, 0, this.v1 );
		vec3FromArray( json.v2, 0, this.v2 );

		return this;

	}

}

export { LineCurve3 };
