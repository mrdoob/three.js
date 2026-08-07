import { Curve } from '../core/Curve.js';
import { QuadraticBezier } from '../core/Interpolations.js';
import {
	vec2Copy,
	vec2Create,
	vec2FromArray,
	vec2Set,
	vec2ToArray
} from '../../math/Vector2Functions.js';

/**
 * A curve representing a 2D Quadratic Bezier curve.
 *
 * ```js
 * const curve = new THREE.QuadraticBezierCurve(
 * 	new THREE.Vector2( - 10, 0 ),
 * 	new THREE.Vector2( 20, 15 ),
 * 	new THREE.Vector2( 10, 0 )
 * )
 *
 * const points = curve.getPoints( 50 );
 * const geometry = new THREE.BufferGeometry().setFromPoints( points );
 *
 * const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
 *
 * // Create the final object to add to the scene
 * const curveObject = new THREE.Line( geometry, material );
 * ```
 *
 * @augments Curve
 */
class QuadraticBezierCurve extends Curve {

	/**
	 * Constructs a new Quadratic Bezier curve.
	 *
	 * @param {Vector2} [v0] - The start point.
	 * @param {Vector2} [v1] - The control point.
	 * @param {Vector2} [v2] - The end point.
	 */
	constructor( v0 = vec2Create(), v1 = vec2Create(), v2 = vec2Create() ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isQuadraticBezierCurve = true;

		this.type = 'QuadraticBezierCurve';

		/**
		 * The start point.
		 *
		 * @type {Vector2}
		 */
		this.v0 = v0;

		/**
		 * The control point.
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
	 * Returns a point on the curve.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {Vector2} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector2} The position on the curve.
	 */
	getPoint( t, optionalTarget = vec2Create() ) {

		const point = optionalTarget;

		const v0 = this.v0, v1 = this.v1, v2 = this.v2;

		vec2Set(
			QuadraticBezier( t, v0.x, v1.x, v2.x ),
			QuadraticBezier( t, v0.y, v1.y, v2.y ),
			point
		);

		return point;

	}

	copy( source ) {

		super.copy( source );

		vec2Copy( source.v0, this.v0 );
		vec2Copy( source.v1, this.v1 );
		vec2Copy( source.v2, this.v2 );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.v0 = vec2ToArray( this.v0 );
		data.v1 = vec2ToArray( this.v1 );
		data.v2 = vec2ToArray( this.v2 );

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		vec2FromArray( json.v0, 0, this.v0 );
		vec2FromArray( json.v1, 0, this.v1 );
		vec2FromArray( json.v2, 0, this.v2 );

		return this;

	}

}

export { QuadraticBezierCurve };
