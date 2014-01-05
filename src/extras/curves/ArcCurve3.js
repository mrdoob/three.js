/**************************************************************
 *	Arc curve
 **************************************************************/

THREE.ArcCurve3 = function ( aX, aY, aZ, aRadius, aStartAngle, aEndAngle, aClockwise ) {

	THREE.EllipseCurve3.call( this, aX, aY, aZ, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise );
};

THREE.ArcCurve3.prototype = Object.create( THREE.EllipseCurve3.prototype );