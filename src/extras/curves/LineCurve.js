import { Curve } from '../core/Curve';

/**************************************************************
 *	Line
 **************************************************************/

function LineCurve ( v1, v2 ) {
	this.isLineCurve = this.isCurve = true;

	this.v1 = v1;
	this.v2 = v2;

};

LineCurve.prototype = Object.create( Curve.prototype );
LineCurve.prototype.constructor = LineCurve;

LineCurve.prototype.getPoint = function ( t ) {

	if ( t === 1 ) {

		return this.v2.clone();

	}

	var point = this.v2.clone().sub( this.v1 );
	point.multiplyScalar( t ).add( this.v1 );

	return point;

};

// Line curve is linear, so we can overwrite default getPointAt

LineCurve.prototype.getPointAt = function ( u ) {

	return this.getPoint( u );

};

LineCurve.prototype.getTangent = function( t ) {

	var tangent = this.v2.clone().sub( this.v1 );

	return tangent.normalize();

};


export { LineCurve };