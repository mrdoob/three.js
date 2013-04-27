/**
 * @author renej
 * NURBS surface object
 *
 * Derives from Curve, overriding getPoint and getTangent.
 *
 * Implementation is based on (x, y [, z=0 [, w=1]]) control points with w=weight.
 *
 **/


/**************************************************************
 *	NURBS surface
 **************************************************************/

THREE.NURBSSurface = function ( degree1, degree2, knots1, knots2 /* arrays of reals */, controlPoints /* array^2 of Vector(2|3|4) */) {

	this.degree1 = degree1;
	this.degree2 = degree2;
	this.knots1 = knots1;
	this.knots2 = knots2;
	this.controlPoints = [];

	var len1 = knots1.length - degree1 - 1;
	var len2 = knots2.length - degree2 - 1;

	//console.log("controlPoints: " + controlPoints);
	//console.log("controlPoints[0][0].x: " + controlPoints[0][0].x);

	// ensure Vector4 for control points
	for (var i = 0; i < len1; ++i) {
		this.controlPoints[i] = []
		for (var j = 0; j < len2; ++j) {
			//console.log("i=" + i + " j=" + j);
			var point = controlPoints[i][j];
			this.controlPoints[i][j] = new THREE.Vector4(point.x, point.y, point.z, point.w);
		}
	}
};


THREE.NURBSSurface.prototype = {

	constructor: THREE.NURBSSurface,

	getPoint: function ( t1, t2 ) {

		//console.log("this.knots1=" + this.knots1);
		//console.log("this.knots2=" + this.knots2);
		//console.log("this.controlPoints=" + this.controlPoints);
		var u = this.knots1[0] + t1 * (this.knots1[this.knots1.length - 1] - this.knots1[0]); // linear mapping t1->u
		var v = this.knots2[0] + t2 * (this.knots2[this.knots2.length - 1] - this.knots2[0]); // linear mapping t2->u

		var point = THREE.NURBSSurface.Utils.calcSurfacePoint(this.degree1, this.degree2, this.knots1, this.knots2, this.controlPoints, u, v);
		//console.log("u=" + u + " v=" + v + " point=" + point.x + ", " + point.y + ", " + point.z);
		return point;
	}
};


/**************************************************************
 *	Utils
 **************************************************************/

THREE.NURBSSurface.Utils = {

	/*
	Calculate rational B-Spline surface point. See The NURBS Book, page 134, algorithm A4.3.
 
	p1, p2 : degrees of B-Spline surface
	U1, U2 : knot vectors
	P      : control points (x, y, z, w)
	u, v   : parametric values

	returns point for given (u, v)
	*/
	calcSurfacePoint: function( p, q, U, V, P, u, v ) {
		var uspan = THREE.NURBSCurve.Utils.findSpan(p, u, U);
		var vspan = THREE.NURBSCurve.Utils.findSpan(q, v, V);
		var Nu = THREE.NURBSCurve.Utils.calcBasisFunctions(uspan, u, p, U);
		var Nv = THREE.NURBSCurve.Utils.calcBasisFunctions(vspan, v, q, V);
		var temp = [];

		for (var l = 0; l <= q; ++l) {
			temp[l] = new THREE.Vector4(0, 0, 0, 0);
			for (var k = 0; k <= p; ++k) {
				var point = P[uspan - p + k][vspan - q + l].clone();
				var w = point.w;
				point.x *= w;
				point.y *= w;
				point.z *= w;
				temp[l].add(point.multiplyScalar(Nu[k]));
			}
		}

		var Sw = new THREE.Vector4(0, 0, 0, 0);
		for (var l = 0; l <= q; ++l) {
			Sw.add(temp[l].multiplyScalar(Nv[l]));
		}

		Sw.divideScalar(Sw.w);
		return new THREE.Vector3(Sw.x, Sw.y, Sw.z);
	}

};

