/**
 * @author bhouston / http://exocortex.com
 */

THREE.Plane = function ( normal, constant ) {

	this.normal = ( normal !== undefined ) ? normal : new THREE.Vector3( 1, 0, 0 );
	this.constant = ( constant !== undefined ) ? constant : 0;

};

THREE.Plane.prototype = {

	constructor: THREE.Plane,

	set: function ( normal, constant ) {

		this.normal.copy( normal );
		this.constant = constant;

		return this;

	},

	setComponents: function ( x, y, z, w ) {

		this.normal.set( x, y, z );
		this.constant = w;

		return this;

	},

	setFromNormalAndCoplanarPoint: function ( normal, point ) {

		this.normal.copy( normal );
		this.constant = - point.dot( this.normal );	// must be this.normal, not normal, as this.normal is normalized

		return this;

	},

	setFromCoplanarPoints: function ( a, b, c ) {

		var normal = THREE.Plane.__v1.subVectors( c, b ).cross( THREE.Plane.__v2.subVectors( a, b ) ).normalize();

		// Q: should an error be thrown if normal is zero (e.g. degenerate plane)?

		this.setFromNormalAndCoplanarPoint( normal, a );

		return this;

	},

	copy: function ( plane ) {

		this.normal.copy( plane.normal );
		this.constant = plane.constant;

		return this;

	},

	normalize: function () {

		// Note: will lead to a divide by zero if the plane is invalid.

		var inverseNormalLength = 1.0 / this.normal.length();
		this.normal.multiplyScalar( inverseNormalLength );
		this.constant *= inverseNormalLength;

		return this;

	},

	negate: function () {

		this.constant *= -1;
		this.normal.negate();

		return this;

	},

	distanceToPoint: function ( point ) {

		return this.normal.dot( point ) + this.constant;

	},

	distanceToSphere: function ( sphere ) {

		return this.distanceToPoint( sphere.center ) - sphere.radius;

	},

	projectPoint: function ( point, optionalTarget ) {

		return this.orthoPoint( point, optionalTarget ).sub( point ).negate();

	},

	orthoPoint: function ( point, optionalTarget ) {

		var perpendicularMagnitude = this.distanceToPoint( point );

		var result = optionalTarget || new THREE.Vector3();
		return result.copy( this.normal ).multiplyScalar( perpendicularMagnitude );

	},

	isIntersectionLine: function ( startPoint, endPoint ) {

		// Note: this tests if a line intersects the plane, not whether it (or its end-points) are coplanar with it.

		var startSign = this.distanceToPoint( startPoint );
		var endSign = this.distanceToPoint( endPoint );

		return ( startSign < 0 && endSign > 0 ) || ( endSign < 0 && startSign > 0 );

	},

	intersectLine: function ( startPoint, endPoint, optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();

		var direction = THREE.Plane.__v1.subVectors( endPoint, startPoint );

		var denominator = this.normal.dot( direction );

		if ( denominator == 0 ) {

			// line is coplanar, return origin
			if( this.distanceToPoint( startPoint ) == 0 ) {

				return result.copy( startPoint );

			}

			// Unsure if this is the correct method to handle this case.
			return undefined;

		}

		var t = - ( startPoint.dot( this.normal ) + this.constant ) / denominator;

		if( t < 0 || t > 1 ) {

			return undefined;

		}

		return result.copy( direction ).multiplyScalar( t ).add( startPoint );

	},

	coplanarPoint: function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();
		return result.copy( this.normal ).multiplyScalar( - this.constant );

	},

	transform: function ( matrix, optionalNormalMatrix ) {

		// compute new normal based on theory here:
		// http://www.songho.ca/opengl/gl_normaltransform.html
		optionalNormalMatrix = optionalNormalMatrix || new THREE.Matrix3().getInverse( matrix ).transpose();
		var newNormal = THREE.Plane.__v1.copy( this.normal ).applyMatrix3( optionalNormalMatrix );

		var newCoplanarPoint = this.coplanarPoint( THREE.Plane.__v2 );
		newCoplanarPoint.applyMatrix4( matrix );

		this.setFromNormalAndCoplanarPoint( newNormal, newCoplanarPoint );

		return this;

	},

	translate: function ( offset ) {

		this.constant = this.constant - offset.dot( this.normal );

		return this;

	},

	equals: function ( plane ) {

		return plane.normal.equals( this.normal ) && ( plane.constant == this.constant );

	},

	clone: function () {

		return new THREE.Plane().copy( this );

	}

};

THREE.Plane.__vZero = new THREE.Vector3( 0, 0, 0 );
THREE.Plane.__v1 = new THREE.Vector3();
THREE.Plane.__v2 = new THREE.Vector3();
