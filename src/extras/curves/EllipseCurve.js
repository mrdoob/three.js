/**************************************************************
 *	Ellipse curve
 **************************************************************/

THREE.EllipseCurve = function ( aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation ) {

	this.aX = aX;
	this.aY = aY;

	this.xRadius = xRadius;
	this.yRadius = yRadius;

	this.aStartAngle = aStartAngle;
	this.aEndAngle = aEndAngle;

	this.aClockwise = aClockwise;
	
	this.aRotation = aRotation || 0;

};

THREE.EllipseCurve.prototype = Object.create( THREE.Curve.prototype );
THREE.EllipseCurve.prototype.constructor = THREE.EllipseCurve;

THREE.EllipseCurve.prototype.getPoint = function ( t ) {

	// Calculate deltaAngle just once.
	var twoPi = Math.PI * 2;
	if ( this.deltaAngle === undefined ) {

		var deltaAngle = this.aEndAngle - this.aStartAngle;
		var samePoints = Math.abs( deltaAngle ) < Number.EPSILON;

		while ( deltaAngle < 0 ) deltaAngle += twoPi;
		while ( deltaAngle > twoPi ) deltaAngle -= twoPi;

		if ( deltaAngle < Number.EPSILON ) {

			if ( samePoints ) {

				deltaAngle = 0;

			} else {

				deltaAngle = twoPi;

			}

		}

		if ( this.aClockwise === true && deltaAngle != twoPi && !samePoints ) {

			deltaAngle = deltaAngle - twoPi;

		}

		this.deltaAngle = deltaAngle;

	}
	
	var angle = this.aStartAngle + t * this.deltaAngle;
	var x = this.aX + this.xRadius * Math.cos( angle );
	var y = this.aY + this.yRadius * Math.sin( angle );

	if ( this.aRotation !== 0 ) {

		var cos = Math.cos( this.aRotation );
		var sin = Math.sin( this.aRotation );

		var tx = x, ty = y;

		// Rotate the point about the center of the ellipse.
		x = ( tx - this.aX ) * cos - ( ty - this.aY ) * sin + this.aX;
		y = ( tx - this.aX ) * sin + ( ty - this.aY ) * cos + this.aY;

	}

	return new THREE.Vector2( x, y );

};
