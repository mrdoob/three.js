/**
 * Ellipse curve
 */

module.exports = EllipseCurve;

var Curve = require( "../core/Curve" ),
	Vector2 = require( "../../math/Vector2" );

function EllipseCurve( aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation ) {

	this.aX = aX;
	this.aY = aY;

	this.xRadius = xRadius;
	this.yRadius = yRadius;

	this.aStartAngle = aStartAngle;
	this.aEndAngle = aEndAngle;

	this.aClockwise = aClockwise;
	
	this.aRotation = aRotation || 0;

}

EllipseCurve.prototype = Object.create( Curve.prototype );
EllipseCurve.prototype.constructor = EllipseCurve;

EllipseCurve.prototype.getPoint = function ( t ) {

	var deltaAngle = this.aEndAngle - this.aStartAngle;

	if ( deltaAngle < 0 ) { deltaAngle += Math.PI * 2; }
	if ( deltaAngle > Math.PI * 2 ) { deltaAngle -= Math.PI * 2; }

	var angle;

	if ( this.aClockwise === true ) {

		angle = this.aEndAngle + ( 1 - t ) * ( Math.PI * 2 - deltaAngle );

	} else {

		angle = this.aStartAngle + t * deltaAngle;

	}
	
	var x = this.aX + this.xRadius * Math.cos( angle );
	var y = this.aY + this.yRadius * Math.sin( angle );

	if ( this.aRotation !== 0 ) {

		var cos = Math.cos( this.aRotation );
		var sin = Math.sin( this.aRotation );

		var tx = x, ty = y;

		// Rotate the point about the center of the ellipse.
		x = ( tx - this.aX ) * cos - ( ty - this.aY ) * sin + this.aX;
		y = ( tx - this.aX ) * sin + ( ty - this.aY ) * cos + this.aY;

	}

	return new Vector2( x, y );

};
