import { Curve } from '../core/Curve';
import { CubicBezier } from '../core/Interpolations';
import { Vector2 } from '../../math/Vector2';


function CubicBezierCurve( v0, v1, v2, v3 ) {

	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;
	this.v3 = v3;

}

CubicBezierCurve.prototype = Object.create( Curve.prototype );
CubicBezierCurve.prototype.constructor = CubicBezierCurve;

CubicBezierCurve.prototype.getPoint = function ( t ) {

	var v0 = this.v0, v1 = this.v1, v2 = this.v2, v3 = this.v3;

	return new Vector2(
		CubicBezier( t, v0.x, v1.x, v2.x, v3.x ),
		CubicBezier( t, v0.y, v1.y, v2.y, v3.y )
	);

};


export { CubicBezierCurve };
