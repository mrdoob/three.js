import { Curve } from '../core/Curve.js';
import { CatmullRom } from '../core/Interpolations.js';
import {
	vec2Copy,
	vec2Create,
	vec2FromArray,
	vec2Set,
	vec2ToArray
} from '../../math/Vector2Functions.js';

/**
 * A curve representing a 2D spline curve.
 *
 * ```js
 * // Create a sine-like wave
 * const curve = new THREE.SplineCurve( [
 * 	new THREE.Vector2( -10, 0 ),
 * 	new THREE.Vector2( -5, 5 ),
 * 	new THREE.Vector2( 0, 0 ),
 * 	new THREE.Vector2( 5, -5 ),
 * 	new THREE.Vector2( 10, 0 )
 * ] );
 *
 * const points = curve.getPoints( 50 );
 * const geometry = new THREE.BufferGeometry().setFromPoints( points );
 *
 * const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
 *
 * // Create the final object to add to the scene
 * const splineObject = new THREE.Line( geometry, material );
 * ```
 *
 * @augments Curve
 */
class SplineCurve extends Curve {

	/**
	 * Constructs a new 2D spline curve.
	 *
	 * @param {Array<Vector2>} [points] -  An array of 2D points defining the curve.
	 */
	constructor( points = [] ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSplineCurve = true;

		this.type = 'SplineCurve';

		/**
		 * An array of 2D points defining the curve.
		 *
		 * @type {Array<Vector2>}
		 */
		this.points = points;

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

		const points = this.points;
		const p = ( points.length - 1 ) * t;

		const intPoint = Math.floor( p );
		const weight = p - intPoint;

		const p0 = points[ intPoint === 0 ? intPoint : intPoint - 1 ];
		const p1 = points[ intPoint ];
		const p2 = points[ intPoint > points.length - 2 ? points.length - 1 : intPoint + 1 ];
		const p3 = points[ intPoint > points.length - 3 ? points.length - 1 : intPoint + 2 ];

		vec2Set(
			CatmullRom( weight, p0.x, p1.x, p2.x, p3.x ),
			CatmullRom( weight, p0.y, p1.y, p2.y, p3.y ),
			point
		);

		return point;

	}

	copy( source ) {

		super.copy( source );

		this.points = [];

		for ( let i = 0, l = source.points.length; i < l; i ++ ) {

			this.points.push( vec2Copy( source.points[ i ] ) );

		}

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.points = [];

		for ( let i = 0, l = this.points.length; i < l; i ++ ) {

			data.points.push( vec2ToArray( this.points[ i ] ) );

		}

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.points = [];

		for ( let i = 0, l = json.points.length; i < l; i ++ ) {

			this.points.push( vec2FromArray( json.points[ i ] ) );

		}

		return this;

	}

}

export { SplineCurve };
