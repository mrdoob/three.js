import { Vector3 } from '../../math/Vector3.js';
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
	constructor( v1 = new Vector3(), v2 = new Vector3() ) {

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
	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		if ( t === 1 ) {

			point.copy( this.v2 );

		} else {

			point.copy( this.v2 ).sub( this.v1 );
			point.multiplyScalar( t ).add( this.v1 );

		}

		return point;

	}

	// Line curve is linear, so we can overwrite default getPointAt
	getPointAt( u, optionalTarget ) {

		return this.getPoint( u, optionalTarget );

	}

	getTangent( t, optionalTarget = new Vector3() ) {

		return optionalTarget.subVectors( this.v2, this.v1 ).normalize();

	}

	getTangentAt( u, optionalTarget ) {

		return this.getTangent( u, optionalTarget );

	}

	copy( source ) {

		super.copy( source );

		this.v1.copy( source.v1 );
		this.v2.copy( source.v2 );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.v1 = this.v1.toArray();
		data.v2 = this.v2.toArray();

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.v1.fromArray( json.v1 );
		this.v2.fromArray( json.v2 );

		return this;

	}

}

export { LineCurve3 };
