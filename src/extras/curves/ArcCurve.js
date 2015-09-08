/**
 * Arc curve
 */

module.exports = ArcCurve;

var EllipseCurve = require( "./EllipseCurve" );

function ArcCurve( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise ) {

	EllipseCurve.call( this, aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise );

}

ArcCurve.prototype = Object.create( EllipseCurve.prototype );
ArcCurve.prototype.constructor = ArcCurve;
