/**************************************************************
 *	Quadratic Bezier curve
 **************************************************************/


THREE.QuadraticBezierCurve = function ( v0, v1, v2 ) {

	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;

};

THREE.QuadraticBezierCurve.prototype = Object.create( THREE.Curve.prototype );


THREE.QuadraticBezierCurve.prototype.getPoint = function ( t ) {

	var vector = new THREE.Vector2();

	vector.x = THREE.Shape.Utils.b2( t, this.v0.x, this.v1.x, this.v2.x );
	vector.y = THREE.Shape.Utils.b2( t, this.v0.y, this.v1.y, this.v2.y );

	return vector;

};


THREE.QuadraticBezierCurve.prototype.getTangent = function( t ) {

	var vector = new THREE.Vector2();

	vector.x = THREE.Curve.Utils.tangentQuadraticBezier( t, this.v0.x, this.v1.x, this.v2.x );
	vector.y = THREE.Curve.Utils.tangentQuadraticBezier( t, this.v0.y, this.v1.y, this.v2.y );

	// returns unit vector

	return vector.normalize();

};
