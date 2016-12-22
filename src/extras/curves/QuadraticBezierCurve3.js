import { Curve } from '../core/Curve';
import { QuadraticBezier } from '../core/Interpolations';
import { Vector3 } from '../../math/Vector3';

/**************************************************************
 *	Quadratic Bezier 3D curve
 **************************************************************/

var QuadraticBezierCurve3 = Curve.create(

	function ( v0, v1, v2 ) {

		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;

	},

	function ( t ) {

		var v0 = this.v0, v1 = this.v1, v2 = this.v2;

		return new Vector3(
			QuadraticBezier( t, v0.x, v1.x, v2.x ),
			QuadraticBezier( t, v0.y, v1.y, v2.y ),
			QuadraticBezier( t, v0.z, v1.z, v2.z )
		);

	}

);


export { QuadraticBezierCurve3 };
