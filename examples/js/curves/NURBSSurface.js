/**
 * Generated from 'examples\modules\curves\NURBSSurface.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../../build/three.module.js'), require('./NURBSUtils.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../../build/three.module.js', './NURBSUtils.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE,global.THREE));
}(this, (function (exports,THREE,NURBSUtils_js) { 'use strict';

/**
 * @author renej
 * NURBS surface object
 *
 * Implementation is based on (x, y [, z=0 [, w=1]]) control points with w=weight.
 *
 **/



/**************************************************************
 *	NURBS surface
 **************************************************************/

exports.NURBSSurface = function ( degree1, degree2, knots1, knots2 /* arrays of reals */, controlPoints /* array^2 of Vector(2|3|4) */ ) {

	this.degree1 = degree1;
	this.degree2 = degree2;
	this.knots1 = knots1;
	this.knots2 = knots2;
	this.controlPoints = [];

	var len1 = knots1.length - degree1 - 1;
	var len2 = knots2.length - degree2 - 1;

	// ensure Vector4 for control points
	for ( var i = 0; i < len1; ++ i ) {

		this.controlPoints[ i ] = [];
		for ( var j = 0; j < len2; ++ j ) {

			var point = controlPoints[ i ][ j ];
			this.controlPoints[ i ][ j ] = new THREE.Vector4( point.x, point.y, point.z, point.w );

		}

	}

};


exports.NURBSSurface.prototype = {

	constructor: exports.NURBSSurface,

	getPoint: function ( t1, t2, target ) {

		var u = this.knots1[ 0 ] + t1 * ( this.knots1[ this.knots1.length - 1 ] - this.knots1[ 0 ] ); // linear mapping t1->u
		var v = this.knots2[ 0 ] + t2 * ( this.knots2[ this.knots2.length - 1 ] - this.knots2[ 0 ] ); // linear mapping t2->u

		NURBSUtils_js.NURBSUtils.calcSurfacePoint( this.degree1, this.degree2, this.knots1, this.knots2, this.controlPoints, u, v, target );

	}
};

Object.defineProperty(exports, '__esModule', { value: true });

})));
