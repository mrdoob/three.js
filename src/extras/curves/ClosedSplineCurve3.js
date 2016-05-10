/**************************************************************
 *	Closed Spline 3D curve
 **************************************************************/


THREE.ClosedSplineCurve3 = function ( points ) {

	console.warn( 'THREE.ClosedSplineCurve3 has been deprecated. Please use THREE.CatmullRomCurve3.' );

	THREE.CatmullRomCurve3.call( this, points );
	this.type = 'catmullrom';
	this.closed = true;

};

THREE.ClosedSplineCurve3.prototype = Object.create( THREE.CatmullRomCurve3.prototype );
