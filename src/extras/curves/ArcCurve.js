import { EllipseCurve } from './EllipseCurve.js';

class ArcCurve extends EllipseCurve {

	constructor( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise ) {

		super( aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise );

		this.type = 'ArcCurve';

	}

}

ArcCurve.prototype.isArcCurve = true;

export { ArcCurve };
