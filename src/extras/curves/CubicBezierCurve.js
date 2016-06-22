/**************************************************************
 *	Cubic Bezier curve
 **************************************************************/

THREE.CubicBezierCurve = function ( v0, v1, v2, v3 ) {

	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;
	this.v3 = v3;

};

THREE.CubicBezierCurve.prototype = Object.create( THREE.Curve.prototype );
THREE.CubicBezierCurve.prototype.constructor = THREE.CubicBezierCurve;

THREE.CubicBezierCurve.prototype.getPoint = function ( t ) {

	var b3 = THREE.ShapeUtils.b3;

	return new THREE.Vector2( 
		b3( t, this.v0.x, this.v1.x, this.v2.x, this.v3.x ),
		b3( t, this.v0.y, this.v1.y, this.v2.y, this.v3.y )
	);

};

THREE.CubicBezierCurve.prototype.getTangent = function( t ) {

	var tangentCubicBezier = THREE.CurveUtils.tangentCubicBezier;

	return new THREE.Vector2( 
		tangentCubicBezier( t, this.v0.x, this.v1.x, this.v2.x, this.v3.x ),
		tangentCubicBezier( t, this.v0.y, this.v1.y, this.v2.y, this.v3.y )
	).normalize();

};
