import { Curve } from '../core/Curve';
import { CubicBezier } from '../core/Interpolations';
import { Vector3 } from '../../math/Vector3';


function CubicBezierCurve3( v0, v1, v2, v3 ) {

	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;
	this.v3 = v3;

}

CubicBezierCurve3.prototype = Object.create( Curve.prototype );
CubicBezierCurve3.prototype.constructor = CubicBezierCurve3;

CubicBezierCurve3.prototype.getPoint = function ( t ) {

	var v0 = this.v0, v1 = this.v1, v2 = this.v2, v3 = this.v3;

	return new Vector3(
		CubicBezier( t, v0.x, v1.x, v2.x, v3.x ),
		CubicBezier( t, v0.y, v1.y, v2.y, v3.y ),
		CubicBezier( t, v0.z, v1.z, v2.z, v3.z )
	);

};


export { CubicBezierCurve3 };
