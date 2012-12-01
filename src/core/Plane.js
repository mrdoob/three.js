/**
 * @author Ben Houston / ben@exocortex.com / http://github.com/bhouston
 */

THREE.Plane = function ( normal, constant ) {

	this.normal = normal || new THREE.Vector3();
	this.constant = constant || 0;

};

THREE.Plane.prototype = {

	constructor: THREE.Plane,

	set: function ( normal, constant ) {

		this.normal = normal;
		this.constant = constant;

		return this;
	},

	setComponents: function ( x, y, z, w ) {

		this.normal.set( x, y, z );
		this.constant = w;

		return this;
	},

	setFromNormalAndCoplanarPoint: function ( normal, point ) {
		// NOTE: This function doens't support optional parameters like the constructor.

		this.normal = normal;
		this.constant = - point.dot( normal );

		return this;
	},

	setFromCoplanarPoints: function ( a, b, c ) {
		// NOTE: This function doens't support optional parameters like the constructor.

		var normal = new THREE.Vector3().sub( b, a ).cross(
			new THREE.Vector3().sub( c, a ) );

		// Q: should an error be thrown if normal is zero (e.g. degenerate plane)?
		this.setFromNormalAndCoplanarPoint( normal, a );
		
		return this;
	},

	copy: function ( plane ) {

		this.normal = plane.normal;
		this.constant = plane.constant;

		return this;
	},

	flip: function () {

		// Note: can also be flipped by inverting constant, but I like constant to stay positive generally.
		this.normal.negate();

		return this;
	},

	normalize: function () {

		// Note: will lead to a divide by zero if the plane is invalid.
		var inverseNormalLength = 1.0 / this.normal.length();
		this.normal.multipleByScalar( inverseNormalLength );
		this.constant *= inverseNormalLength;

		return this;
	},

	distanceToPoint: function ( point ) {

		return this.normal.dot( point ) + this.constant;
	},

	distanceToSphere: function ( sphere ) {

		return this.distanceToPoint( sphere.center ) - sphere.radius;
	},

	projectPoint: function ( point ) {		
		
		// TODO: optimize this by expanding and simplifying
		
		return new THREE.Vector3().copy( point ).sub( this.orthoPoint( point ) );
	},

	orthoPoint: function ( point ) {		

		var perpendicularMagnitude = this.distanceToPoint( point );

		return new THREE.Vector3().copy( this.normal ).multipleByScalar( perpendicularMagnitude );
	},

	intersectsLine: function ( startPoint, endPoint ) {	

		// Note: this tests if a line intersects the plane, not whether it (or its end-points) are coplanar with it.
		var startSign = this.distanceToPoint( startPoint );
		var endSign = this.distanceToPoint( endPoint );

		return ( startSign < 0 && endSign > 0 ) || ( endSign < 0 && startSign > 0 );
	},

	coplanarPoint: function () {		
		
		return new THREE.Vector3().copy( this.normal ).multiplyScalar( - this.constant );
	},

	translate: function ( offset ) {

		// TODO: test this.
		this.constant =	- offset.dot( normal );

		return this;
	}

};