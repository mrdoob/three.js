import { Vector3 } from '../../math/Vector3';
import { ShapeUtils } from '../ShapeUtils';
import { Curve } from '../core/Curve';

var CubicBezierCurve3;

/**************************************************************
 *	Cubic Bezier 3D curve
 **************************************************************/

CubicBezierCurve3 = Curve.create(

	function ( v0, v1, v2, v3 ) {

		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;

	},

	function ( t ) {

		var b3 = ShapeUtils.b3;

		return new Vector3(
			b3( t, this.v0.x, this.v1.x, this.v2.x, this.v3.x ),
			b3( t, this.v0.y, this.v1.y, this.v2.y, this.v3.y ),
			b3( t, this.v0.z, this.v1.z, this.v2.z, this.v3.z )
		);

	}

);


export { CubicBezierCurve3 };