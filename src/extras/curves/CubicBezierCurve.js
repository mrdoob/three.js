import { Curve } from '../core/Curve.js';
import { CubicBezier } from '../core/Interpolations.js';
import { Vector2 } from '../../math/Vector2.js';

/**
 * A curve representing a 2D Cubic Bezier curve.
 *
 * ```js
 * const curve = new THREE.CubicBezierCurve(
 * 	new THREE.Vector2( - 0, 0 ),
 * 	new THREE.Vector2( - 5, 15 ),
 * 	new THREE.Vector2( 20, 15 ),
 * 	new THREE.Vector2( 10, 0 )
 * );
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
class CubicBezierCurve extends Curve {

	/**
	 * Constructs a new Cubic Bezier curve.
	 *
	 * @param {Vector2} [v0] - The start point.
	 * @param {Vector2} [v1] - The first control point.
	 * @param {Vector2} [v2] - The second control point.
	 * @param {Vector2} [v3] - The end point.
	 */
	constructor( v0 = new Vector2(), v1 = new Vector2(), v2 = new Vector2(), v3 = new Vector2() ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCubicBezierCurve = true;

		this.type = 'CubicBezierCurve';

		/**
		 * The start point.
		 *
		 * @type {Vector2}
		 */
		this.v0 = v0;

		/**
		 * The first control point.
		 *
		 * @type {Vector2}
		 */
		this.v1 = v1;

		/**
		 * The second control point.
		 *
		 * @type {Vector2}
		 */
		this.v2 = v2;

		/**
		 * The end point.
		 *
		 * @type {Vector2}
		 */
		this.v3 = v3;

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

		const v0 = this.v0, v1 = this.v1, v2 = this.v2, v3 = this.v3;

		point.set(
			CubicBezier( t, v0.x, v1.x, v2.x, v3.x ),
			CubicBezier( t, v0.y, v1.y, v2.y, v3.y )
		);

		return point;

	}

	copy( source ) {

		super.copy( source );

		this.v0.copy( source.v0 );
		this.v1.copy( source.v1 );
		this.v2.copy( source.v2 );
		this.v3.copy( source.v3 );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.v0 = this.v0.toArray();
		data.v1 = this.v1.toArray();
		data.v2 = this.v2.toArray();
		data.v3 = this.v3.toArray();

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.v0.fromArray( json.v0 );
		this.v1.fromArray( json.v1 );
		this.v2.fromArray( json.v2 );
		this.v3.fromArray( json.v3 );

		return this;

	}

}

export { CubicBezierCurve };
