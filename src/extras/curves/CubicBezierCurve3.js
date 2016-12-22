import { CubicBezier } from '../core/Bezier';
import { Curve } from '../core/Curve';
import { Vector3 } from '../../math/Vector3';

/**************************************************************
 *	Cubic Bezier 3D curve
 **************************************************************/

var CubicBezierCurve3 = Curve.create(

	function ( v0, v1, v2, v3 ) {

		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;

	},

	function ( t ) {

		var v0 = this.v0, v1 = this.v1, v2 = this.v2, v3 = this.v3;

		return new Vector3(
			CubicBezier( t, v0.x, v1.x, v2.x, v3.x ),
			CubicBezier( t, v0.y, v1.y, v2.y, v3.y ),
			CubicBezier( t, v0.z, v1.z, v2.z, v3.z )
		);

	}

);


export { CubicBezierCurve3 };
