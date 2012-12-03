/**
 * @author bhouston / http://exocortex.com
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

		this.normal = normal;
		this.constant = - point.dot( normal );

		return this;
	},

	setFromCoplanarPoints: function ( a, b, c ) {

		var normal = THREE.Plane3.__v1.sub( b, a ).cross(
			THREE.Plane3.__v2.sub( c, a ) );

		// Q: should an error be thrown if normal is zero (e.g. degenerate plane)?
		this.setFromNormalAndCoplanarPoint( normal, a );
		
		return this;
	},

	copy: function ( plane ) {

		this.normal.copy( plane.normal );
		this.constant = plane.constant;

		return this;
	},

	flip: function () {

		this.normal.negate();

		return this;
	},

	normalize: function () {

		// Note: will lead to a divide by zero if the plane is invalid.
		var inverseNormalLength = 1.0 / this.normal.length();
		this.normal.multiplyScalar( inverseNormalLength );
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
		
		return this.orthoPoint( point ).subSelf( point ).negate();
	},

	orthoPoint: function ( point ) {		

		var perpendicularMagnitude = this.distanceToPoint( point );

		return new THREE.Vector3().copy( this.normal ).multiplyScalar( perpendicularMagnitude );
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

		this.constant =	- offset.dot( normal );

		return this;
	},

	equals: function ( plane ) {

		return plane.normal.equals( this.normal ) && ( sphere.constant == this.constant );

	},

	clone: function () {

		return new THREE.Plane3().copy( this );

	}

};

THREE.Plane.__v1 = new THREE.Vector3();
THREE.Plane.__v2 = new THREE.Vector3();