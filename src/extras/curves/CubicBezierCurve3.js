import { Curve } from '../core/Curve.js';
import { CubicBezier } from '../core/Interpolations.js';
import { Vector3 } from '../../math/Vector3.js';


function CubicBezierCurve3( v0, v1, v2, v3 ) {

	Curve.call( this );

	this.type = 'CubicBezierCurve3';

	this.v0 = v0 || new Vector3();
	this.v1 = v1 || new Vector3();
	this.v2 = v2 || new Vector3();
	this.v3 = v3 || new Vector3();

}

CubicBezierCurve3.prototype = Object.create( Curve.prototype );
CubicBezierCurve3.prototype.constructor = CubicBezierCurve3;

CubicBezierCurve3.prototype.isCubicBezierCurve3 = true;

CubicBezierCurve3.prototype.getPoint = function ( t, optionalTarget ) {

	var point = optionalTarget || new Vector3();

	var v0 = this.v0, v1 = this.v1, v2 = this.v2, v3 = this.v3;

	point.set(
		CubicBezier( t, v0.x, v1.x, v2.x, v3.x ),
		CubicBezier( t, v0.y, v1.y, v2.y, v3.y ),
		CubicBezier( t, v0.z, v1.z, v2.z, v3.z )
	);

	return point;

};

CubicBezierCurve3.prototype.copy = function ( source ) {

	Curve.prototype.copy.call( this, source );

	this.v0.copy( source.v0 );
	this.v1.copy( source.v1 );
	this.v2.copy( source.v2 );
	this.v3.copy( source.v3 );

	return this;

};


export { CubicBezierCurve3 };
