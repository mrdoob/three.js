/**************************************************************
 *	Quadratic Bezier curve
 **************************************************************/


THREE.QuadraticBezierCurve = function ( v0, v1, v2 ) {

	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;

};

THREE.QuadraticBezierCurve.prototype = Object.create( THREE.Curve.prototype );
THREE.QuadraticBezierCurve.prototype.constructor = THREE.QuadraticBezierCurve;


THREE.QuadraticBezierCurve.prototype.getPoint = function ( t ) {

	var b2 = THREE.ShapeUtils.b2;

	return new THREE.Vector2(
		b2( t, this.v0.x, this.v1.x, this.v2.x ),
		b2( t, this.v0.y, this.v1.y, this.v2.y )
	);

};


THREE.QuadraticBezierCurve.prototype.getTangent = function( t ) {

	var tangentQuadraticBezier = THREE.CurveUtils.tangentQuadraticBezier;

	return new THREE.Vector2(
		tangentQuadraticBezier( t, this.v0.x, this.v1.x, this.v2.x ),
		tangentQuadraticBezier( t, this.v0.y, this.v1.y, this.v2.y )
	).normalize();

};
