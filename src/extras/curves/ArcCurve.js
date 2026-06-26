import { EllipseCurve } from './EllipseCurve.js';

/**
 * A curve representing an arc.
 *
 * @augments EllipseCurve
 */
class ArcCurve extends EllipseCurve {

	/**
	 * Constructs a new arc curve.
	 *
	 * @param {number} [aX=0] - The X center of the ellipse.
	 * @param {number} [aY=0] - The Y center of the ellipse.
	 * @param {number} [aRadius=1] - The radius of the ellipse in the x direction.
	 * @param {number} [aStartAngle=0] - The start angle of the curve in radians starting from the positive X axis.
	 * @param {number} [aEndAngle=Math.PI*2] - The end angle of the curve in radians starting from the positive X axis.
	 * @param {boolean} [aClockwise=false] - Whether the ellipse is drawn clockwise or not.
	 */
	constructor( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise ) {

		super( aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isArcCurve = true;

		this.type = 'ArcCurve';

	}

}

export { ArcCurve };
