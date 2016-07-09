import { Curve } from '../core/Curve';
import { Vector2 } from '../../math/Vector2';
import { CurveUtils } from '../CurveUtils';
import { ShapeUtils } from '../ShapeUtils';

/**************************************************************
 *	Cubic Bezier curve
 **************************************************************/

function CubicBezierCurve ( v0, v1, v2, v3 ) {
	this.isCubicBezierCurve = this.isCurve = true;

	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;
	this.v3 = v3;

};

CubicBezierCurve.prototype = Object.create( Curve.prototype );
CubicBezierCurve.prototype.constructor = CubicBezierCurve;

CubicBezierCurve.prototype.getPoint = function ( t ) {

	var b3 = ShapeUtils.b3;

	return new Vector2( 
		b3( t, this.v0.x, this.v1.x, this.v2.x, this.v3.x ),
		b3( t, this.v0.y, this.v1.y, this.v2.y, this.v3.y )
	);

};

CubicBezierCurve.prototype.getTangent = function( t ) {

	var tangentCubicBezier = CurveUtils.tangentCubicBezier;

	return new Vector2( 
		tangentCubicBezier( t, this.v0.x, this.v1.x, this.v2.x, this.v3.x ),
		tangentCubicBezier( t, this.v0.y, this.v1.y, this.v2.y, this.v3.y )
	).normalize();

};


export { CubicBezierCurve };