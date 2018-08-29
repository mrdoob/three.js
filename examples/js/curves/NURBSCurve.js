/**
 * Generated from 'examples\modules\curves\NURBSCurve.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../../build/three.module.js'), require('./NURBSUtils.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../../build/three.module.js', './NURBSUtils.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE,global.THREE));
}(this, (function (exports,THREE,NURBSUtils_js) { 'use strict';

/**
 * @author renej
 * NURBS curve object
 *
 * Derives from Curve, overriding getPoint and getTangent.
 *
 * Implementation is based on (x, y [, z=0 [, w=1]]) control points with w=weight.
 *
 **/



/**************************************************************
 *	NURBS curve
 **************************************************************/

exports.NURBSCurve = function ( degree, knots /* array of reals */, controlPoints /* array of Vector(2|3|4) */, startKnot /* index in knots */, endKnot /* index in knots */ ) {

	THREE.Curve.call( this );

	this.degree = degree;
	this.knots = knots;
	this.controlPoints = [];
	// Used by periodic NURBS to remove hidden spans
	this.startKnot = startKnot || 0;
	this.endKnot = endKnot || ( this.knots.length - 1 );
	for ( var i = 0; i < controlPoints.length; ++ i ) {

		// ensure Vector4 for control points
		var point = controlPoints[ i ];
		this.controlPoints[ i ] = new THREE.Vector4( point.x, point.y, point.z, point.w );

	}

};


exports.NURBSCurve.prototype = Object.create( THREE.Curve.prototype );
exports.NURBSCurve.prototype.constructor = exports.NURBSCurve;


exports.NURBSCurve.prototype.getPoint = function ( t ) {

	var u = this.knots[ this.startKnot ] + t * ( this.knots[ this.endKnot ] - this.knots[ this.startKnot ] ); // linear mapping t->u

	// following results in (wx, wy, wz, w) homogeneous point
	var hpoint = NURBSUtils_js.NURBSUtils.calcBSplinePoint( this.degree, this.knots, this.controlPoints, u );

	if ( hpoint.w != 1.0 ) {

		// project to 3D space: (wx, wy, wz, w) -> (x, y, z, 1)
		hpoint.divideScalar( hpoint.w );

	}

	return new THREE.Vector3( hpoint.x, hpoint.y, hpoint.z );

};


exports.NURBSCurve.prototype.getTangent = function ( t ) {

	var u = this.knots[ 0 ] + t * ( this.knots[ this.knots.length - 1 ] - this.knots[ 0 ] );
	var ders = NURBSUtils_js.NURBSUtils.calcNURBSDerivatives( this.degree, this.knots, this.controlPoints, u, 1 );
	var tangent = ders[ 1 ].clone();
	tangent.normalize();

	return tangent;

};

Object.defineProperty(exports, '__esModule', { value: true });

})));
