import { EllipseCurve } from './EllipseCurve';

/**************************************************************
 *	Arc curve
 **************************************************************/

function ArcCurve ( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise ) {
	this.isArcCurve = this.isEllipseCurve = this.isCurve = true;

	EllipseCurve.call( this, aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise );

};

ArcCurve.prototype = Object.create( EllipseCurve.prototype );
ArcCurve.prototype.constructor = ArcCurve;


export { ArcCurve };