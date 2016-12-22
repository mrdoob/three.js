import { Curve } from '../core/Curve';
import { QuadraticBezier } from '../core/Interpolations';
import { Vector2 } from '../../math/Vector2';

/**************************************************************
 *	Quadratic Bezier curve
 **************************************************************/

var QuadraticBezierCurve = Curve.create(

	function ( v0, v1, v2 ) {

		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;

	},

	function ( t ) {

		var v0 = this.v0, v1 = this.v1, v2 = this.v2;

		return new Vector2(
			QuadraticBezier( t, v0.x, v1.x, v2.x ),
			QuadraticBezier( t, v0.y, v1.y, v2.y )
		);

	}

);


export { QuadraticBezierCurve };
