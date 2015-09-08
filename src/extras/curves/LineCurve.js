/**
 * Line
 */

module.exports = LineCurve;

var Curve = require( "../core/Curve" );

function LineCurve ( v1, v2 ) {

	Curve.call( this );

	this.v1 = v1;
	this.v2 = v2;

}

LineCurve.prototype = Object.create( Curve.prototype );
LineCurve.prototype.constructor = LineCurve;

LineCurve.prototype.getPoint = function ( t ) {

	var point = this.v2.clone().sub( this.v1 );
	point.multiplyScalar( t ).add( this.v1 );

	return point;

};

// Line curve is linear, so we can overwrite default getPointAt

LineCurve.prototype.getPointAt = function ( u ) {

	return this.getPoint( u );

};

LineCurve.prototype.getTangent = function () {

	var tangent = this.v2.clone().sub( this.v1 );

	return tangent.normalize();

};
