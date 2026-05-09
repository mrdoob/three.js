import { Curve } from '../core/Curve.js';
import { QuadraticBezier } from '../core/Interpolations.js';
import { Vector2 } from '../../math/Vector2.js';

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
	constructor( v0 = new Vector2(), v1 = new Vector2(), v2 = new Vector2() ) {

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
	getPoint( t, optionalTarget = new Vector2() ) {

		const point = optionalTarget;

		const v0 = this.v0, v1 = this.v1, v2 = this.v2;

		point.set(
			QuadraticBezier( t, v0.x, v1.x, v2.x ),
			QuadraticBezier( t, v0.y, v1.y, v2.y )
		);

		return point;

	}

	copy( source ) {

		super.copy( source );

		this.v0.copy( source.v0 );
		this.v1.copy( source.v1 );
		this.v2.copy( source.v2 );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.v0 = this.v0.toArray();
		data.v1 = this.v1.toArray();
		data.v2 = this.v2.toArray();

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.v0.fromArray( json.v0 );
		this.v1.fromArray( json.v1 );
		this.v2.fromArray( json.v2 );

		return this;

	}

}

export { QuadraticBezierCurve };
