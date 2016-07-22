import { Curve } from '../core/Curve';
import { Vector2 } from '../../math/Vector2';
import { CurveUtils } from '../CurveUtils';
import { ShapeUtils } from '../ShapeUtils';

/**************************************************************
 *	Quadratic Bezier curve
 **************************************************************/


function QuadraticBezierCurve ( v0, v1, v2 ) {
	this.isQuadraticBezierCurve = this.isCurve = true;

	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;

};

QuadraticBezierCurve.prototype = Object.create( Curve.prototype );
QuadraticBezierCurve.prototype.constructor = QuadraticBezierCurve;


QuadraticBezierCurve.prototype.getPoint = function ( t ) {

	var b2 = ShapeUtils.b2;

	return new Vector2(
		b2( t, this.v0.x, this.v1.x, this.v2.x ),
		b2( t, this.v0.y, this.v1.y, this.v2.y )
	);

};


QuadraticBezierCurve.prototype.getTangent = function( t ) {

	var tangentQuadraticBezier = CurveUtils.tangentQuadraticBezier;

	return new Vector2(
		tangentQuadraticBezier( t, this.v0.x, this.v1.x, this.v2.x ),
		tangentQuadraticBezier( t, this.v0.y, this.v1.y, this.v2.y )
	).normalize();

};


export { QuadraticBezierCurve };