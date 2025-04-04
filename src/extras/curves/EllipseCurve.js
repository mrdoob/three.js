import { Curve } from '../core/Curve.js';
import { Vector2 } from '../../math/Vector2.js';

/**
 * A curve representing an ellipse.
 *
 * ```js
 * const curve = new THREE.EllipseCurve(
 * 	0, 0,
 * 	10, 10,
 * 	0, 2 * Math.PI,
 * 	false,
 * 	0
 * );
 *
 * const points = curve.getPoints( 50 );
 * const geometry = new THREE.BufferGeometry().setFromPoints( points );
 *
 * const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
 *
 * // Create the final object to add to the scene
 * const ellipse = new THREE.Line( geometry, material );
 * ```
 *
 * @augments Curve
 */
class EllipseCurve extends Curve {

	/**
	 * Constructs a new ellipse curve.
	 *
	 * @param {number} [aX=0] - The X center of the ellipse.
	 * @param {number} [aY=0] - The Y center of the ellipse.
	 * @param {number} [xRadius=1] - The radius of the ellipse in the x direction.
	 * @param {number} [yRadius=1] - The radius of the ellipse in the y direction.
	 * @param {number} [aStartAngle=0] - The start angle of the curve in radians starting from the positive X axis.
	 * @param {number} [aEndAngle=Math.PI*2] - The end angle of the curve in radians starting from the positive X axis.
	 * @param {boolean} [aClockwise=false] - Whether the ellipse is drawn clockwise or not.
	 * @param {number} [aRotation=0] - The rotation angle of the ellipse in radians, counterclockwise from the positive X axis.
	 */
	constructor( aX = 0, aY = 0, xRadius = 1, yRadius = 1, aStartAngle = 0, aEndAngle = Math.PI * 2, aClockwise = false, aRotation = 0 ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isEllipseCurve = true;

		this.type = 'EllipseCurve';

		/**
		 * The X center of the ellipse.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.aX = aX;

		/**
		 * The Y center of the ellipse.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.aY = aY;

		/**
		 * The radius of the ellipse in the x direction.
		 * Setting the this value equal to the {@link EllipseCurve#yRadius} will result in a circle.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.xRadius = xRadius;

		/**
		 * The radius of the ellipse in the y direction.
		 * Setting the this value equal to the {@link EllipseCurve#xRadius} will result in a circle.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.yRadius = yRadius;

		/**
		 * The start angle of the curve in radians starting from the positive X axis.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.aStartAngle = aStartAngle;

		/**
		 * The end angle of the curve in radians starting from the positive X axis.
		 *
		 * @type {number}
		 * @default Math.PI*2
		 */
		this.aEndAngle = aEndAngle;

		/**
		 * Whether the ellipse is drawn clockwise or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.aClockwise = aClockwise;

		/**
		 * The rotation angle of the ellipse in radians, counterclockwise from the positive X axis.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.aRotation = aRotation;

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

		const twoPi = Math.PI * 2;
		let deltaAngle = this.aEndAngle - this.aStartAngle;
		const samePoints = Math.abs( deltaAngle ) < Number.EPSILON;

		// ensures that deltaAngle is 0 .. 2 PI
		while ( deltaAngle < 0 ) deltaAngle += twoPi;
		while ( deltaAngle > twoPi ) deltaAngle -= twoPi;

		if ( deltaAngle < Number.EPSILON ) {

			if ( samePoints ) {

				deltaAngle = 0;

			} else {

				deltaAngle = twoPi;

			}

		}

		if ( this.aClockwise === true && ! samePoints ) {

			if ( deltaAngle === twoPi ) {

				deltaAngle = - twoPi;

			} else {

				deltaAngle = deltaAngle - twoPi;

			}

		}

		const angle = this.aStartAngle + t * deltaAngle;
		let x = this.aX + this.xRadius * Math.cos( angle );
		let y = this.aY + this.yRadius * Math.sin( angle );

		if ( this.aRotation !== 0 ) {

			const cos = Math.cos( this.aRotation );
			const sin = Math.sin( this.aRotation );

			const tx = x - this.aX;
			const ty = y - this.aY;

			// Rotate the point about the center of the ellipse.
			x = tx * cos - ty * sin + this.aX;
			y = tx * sin + ty * cos + this.aY;

		}

		return point.set( x, y );

	}

	copy( source ) {

		super.copy( source );

		this.aX = source.aX;
		this.aY = source.aY;

		this.xRadius = source.xRadius;
		this.yRadius = source.yRadius;

		this.aStartAngle = source.aStartAngle;
		this.aEndAngle = source.aEndAngle;

		this.aClockwise = source.aClockwise;

		this.aRotation = source.aRotation;

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.aX = this.aX;
		data.aY = this.aY;

		data.xRadius = this.xRadius;
		data.yRadius = this.yRadius;

		data.aStartAngle = this.aStartAngle;
		data.aEndAngle = this.aEndAngle;

		data.aClockwise = this.aClockwise;

		data.aRotation = this.aRotation;

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.aX = json.aX;
		this.aY = json.aY;

		this.xRadius = json.xRadius;
		this.yRadius = json.yRadius;

		this.aStartAngle = json.aStartAngle;
		this.aEndAngle = json.aEndAngle;

		this.aClockwise = json.aClockwise;

		this.aRotation = json.aRotation;

		return this;

	}

}

export { EllipseCurve };
