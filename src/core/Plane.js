/**
 * @author Ben Houston / ben@exocortex.com / http://github.com/bhouston
 */

( function ( THREE ) {

	var zeroPoint = new THREE.Vector3();

	THREE.Plane = function ( normal, constant ) {

		this.normal = normal || new THREE.Vector3();
		this.constant = constant || 0;

	};

	THREE.Plane.fromNormalAndCoplanarPoint = function ( normal, point ) {
		// NOTE: This function doens't support optional parameters like the constructor.

		return new THREE.Plane( 
			normal,
			- point.dot( normal )
			);
	};

	THREE.Plane.fromCoplanarPoints = function ( a, b, c ) {
		// NOTE: This function doens't support optional parameters like the constructor.

		var normal = new THREE.Vector3().sub( b, a ).cross(
			new THREE.Vector3().sub( c, a ) );

		// Q: should an error be thrown if normal is zero (e.g. degenerate plane)?

		return THREE.Plane.fromNormalAndCoplanarPoint( normal, a );
	};

	THREE.Plane.prototype.set = function ( normal, constant ) {

		this.normal = normal;
		this.constant = constant;

		return this;
	};

	THREE.Plane.prototype.setComponents = function ( x, y, z, w ) {

		this.normal.set( x, y, z );
		this.constant = w;

		return this;
	};

	THREE.Plane.prototype.copy = function ( plane ) {

		this.normal = plane.normal;
		this.constant = plane.constant;

		return this;
	};

	THREE.Plane.prototype.flip = function () {

		// Note: can also be flipped by inverting constant, but I like constant to stay positive generally.
		this.normal.negate();

		return this;
	};

	THREE.Plane.prototype.normalize = function () {

		// Note: will lead to a divide by zero if the plane is invalid.
		var inverseNormalLength = 1.0 / this.normal.length();
		this.normal.multipleByScalar( inverseNormalLength );
		this.constant *= inverseNormalLength;

		return this;
	};

	THREE.Plane.prototype.distanceToPoint = function ( point ) {

		return this.normal.dot( point ) + this.constant;
	};

	THREE.Sphere.prototype.distanceToSphere = function ( sphere ) {

		return this.distanceToPoint( sphere.center ) - sphere.radius;
	};

	THREE.Plane.prototype.projectPoint = function ( point ) {		
		
		// TODO: optimize this by expanding and simplifying
		
		return new THREE.Vector3().copy( point ).sub( this.orthoPoint( point ) );
	};

	THREE.Plane.prototype.orthoPoint = function ( point ) {		

		var perpendicularMagnitude = this.distanceToPoint( point );

		return new THREE.Vector3().copy( this.normal ).multipleByScalar( perpendicularMagnitude );
	};

	THREE.Plane.prototype.intersectsLine = function ( startPoint, endPoint ) {	

		// Note: this tests if a line intersects the plane, not whether it (or its end-points) are coplanar with it.
		var startSign = this.distanceToPoint( startPoint );
		var endSign = this.distanceToPoint( endPoint );

		return ( startSign < 0 && endSign > 0 ) || ( endSign < 0 && startSign > 0 );
	};

	THREE.Plane.prototype.coplanarPoint = function () {		
		
		return new THREE.Vector3().copy( this.normal ).multiplyByScalar( - this.constant );
	};

}( THREE ) );
