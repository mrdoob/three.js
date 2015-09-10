/**
 * Cubic Bezier curve
 */

module.exports = CubicBezierCurve;

var ShapeUtils = require( "../ShapeUtils" ),
	Curve = require( "../core/Curve" ),
	Vector2 = require( "../../math/Vector2" );

function CubicBezierCurve( v0, v1, v2, v3 ) {

	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;
	this.v3 = v3;

}

CubicBezierCurve.prototype = Object.create( Curve.prototype );
CubicBezierCurve.prototype.constructor = CubicBezierCurve;

CubicBezierCurve.prototype.getPoint = function ( t ) {

	var tx, ty;

	tx = ShapeUtils.b3( t, this.v0.x, this.v1.x, this.v2.x, this.v3.x );
	ty = ShapeUtils.b3( t, this.v0.y, this.v1.y, this.v2.y, this.v3.y );

	return new Vector2( tx, ty );

};

CubicBezierCurve.prototype.getTangent = function( t ) {

	var tx, ty;

	tx = Curve.Utils.tangentCubicBezier( t, this.v0.x, this.v1.x, this.v2.x, this.v3.x );
	ty = Curve.Utils.tangentCubicBezier( t, this.v0.y, this.v1.y, this.v2.y, this.v3.y );

	var tangent = new Vector2( tx, ty );
	tangent.normalize();

	return tangent;

};
