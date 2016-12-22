import { b3, tangentCubicBezier } from '../core/Bezier';
import { Curve } from '../core/Curve';
import { Vector2 } from '../../math/Vector2';

/**************************************************************
 *	Cubic Bezier curve
 **************************************************************/

function CubicBezierCurve( v0, v1, v2, v3 ) {

	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;
	this.v3 = v3;

}

CubicBezierCurve.prototype = Object.create( Curve.prototype );
CubicBezierCurve.prototype.constructor = CubicBezierCurve;

CubicBezierCurve.prototype.getPoint = function ( t ) {

	return new Vector2(
		b3( t, this.v0.x, this.v1.x, this.v2.x, this.v3.x ),
		b3( t, this.v0.y, this.v1.y, this.v2.y, this.v3.y )
	);

};

CubicBezierCurve.prototype.getTangent = function ( t ) {

	return new Vector2(
		tangentCubicBezier( t, this.v0.x, this.v1.x, this.v2.x, this.v3.x ),
		tangentCubicBezier( t, this.v0.y, this.v1.y, this.v2.y, this.v3.y )
	).normalize();

};


export { CubicBezierCurve };
