import { EllipseCurve } from './EllipseCurve.js';

class ArcCurve extends EllipseCurve {

	constructor( aX = 0, aY = 0, aRadius = 1, aStartAngle = 0, aEndAngle = Math.PI * 2, aClockwise = false ) {

		super( aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise );

		this.isArcCurve = true;

		this.type = 'ArcCurve';

	}

}

export { ArcCurve };
