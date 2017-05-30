/**************************************************************
 *	Ellipse curve
 **************************************************************/

THREE.EllipseCurve3 = function ( aX, aY, aZ, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise ) {

	this.aX = aX;
	this.aY = aY;
	this.aZ = aZ;

	this.xRadius = xRadius;
	this.yRadius = yRadius;

	this.aStartAngle = aStartAngle;
	this.aEndAngle = aEndAngle;

	this.aClockwise = aClockwise;

};

THREE.EllipseCurve3.prototype = Object.create( THREE.Curve.prototype );

THREE.EllipseCurve3.prototype.getPoint = function ( t ) {

	var angle;
	var deltaAngle = this.aEndAngle - this.aStartAngle;

	if ( deltaAngle < 0 ) deltaAngle += Math.PI * 2;
	if ( deltaAngle > Math.PI * 2 ) deltaAngle -= Math.PI * 2;

	if ( this.aClockwise === true ) {

		angle = this.aEndAngle + ( 1 - t ) * ( Math.PI * 2 - deltaAngle );

	} else {

		angle = this.aStartAngle + t * deltaAngle;

	}

	var tx = this.aX + this.xRadius * Math.cos( angle );
	var ty = this.aY + this.yRadius * Math.sin( angle );

	return new THREE.Vector3( tx, ty, this.aZ );

};
