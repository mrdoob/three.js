/**
 * @author Ben Houston / ben@exocortex.com / http://github.com/bhouston
 */

( function ( THREE ) {

	THREE.Plane = function ( normal, constant ) {
		// TODO: ensure that normal is of length 1 and if it isn't readjust both normal and constant?
		this.normal = normal || new THREE.Vector3();
		this.constant = constant || 0;

	};

	THREE.Plane.prototype.set = function ( normal, constant ) {

		// TODO: ensure that normal is of length 1 and if it isn't readjust both normal and constant?
		this.normal = normal;
		this.constant = constant;

		return this;
	};

	THREE.Plane.prototype.setComponents = function ( x, y, z, w ) {

		// TODO: ensure that normal is of length 1 and if it isn't readjust both normal and constant?
		this.normal.x = x;
		this.normal.y = y;
		this.normal.z = z;
		this.constant = w;

		return this;
	};

	THREE.Plane.prototype.flip = function () {

		// Note: can also be flipped by inverting constant, but I like constant to stay positive generally.
		this.normal.negate();

		return this;
	};

	THREE.Plane.prototype.normalize = function () {

		// Note: will lead to a divide by zero if the plane is invalid.
		var inverseNormalLength = 1.0 / this.normal.length()
		this.normal.multipleByScalar( inverseNormalLength );
		this.constant *= inverseNormalLength;

		return this;
	};

	THREE.Plane.prototype.distanceToPoint = function ( point ) {

		return this.normal.dot( point ) + this.constant;
	};

	THREE.Plane.prototype.projectPoint = function ( point ) {		

		var perpendicularMagnitude = this.distanceToPoint( point );

		return new THREE.Vector3(
			point.x - this.normal.x * perpendicularMagnitude,
			point.y - this.normal.y * perpendicularMagnitude,
			point.z - this.normal.z * perpendicularMagnitude
			);
	};

	THREE.Plane.prototype.orthoPoint = function ( point ) {		

		var perpendicularMagnitude = this.distanceToPoint( point );

		return new THREE.Vector3(
			this.normal.x * perpendicularMagnitude,
			this.normal.y * perpendicularMagnitude,
			this.normal.z * perpendicularMagnitude
			);
	};

	THREE.Plane.prototype.intersectsLine = function ( startPoint, endPoint ) {	

		// Note: this tests if a line intersects the plane, not whether it (or its end-points) are coplanar with it.
		var startSign = this.distanceToPoint( startPoint );
		var endSign = this.distanceToPoint( endPoint );

		return ( startSign < 0 && endSign > 0 ) || ( endSign < 0 && startSign > 0 );
	};

	THREE.Plane.prototype.coplanarPoint = function () {		
		
		return this.projectPoint( new THREE.Vector3( 0,0,0 ) );
	};

}( THREE ) );
