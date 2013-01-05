/**
 * @author bhouston / http://exocortex.com
 */

THREE.Ray = function ( origin, direction ) {


	this.origin = origin !== undefined ? origin.clone() : new THREE.Vector3();
	this.direction = direction !== undefined ? direction.clone() : new THREE.Vector3();

};

THREE.Ray.prototype = {

	constructor: THREE.Ray,

	set: function ( origin, direction ) {

		this.origin.copy( origin );
		this.direction.copy( direction );

		return this;

	},

	copy: function ( ray ) {

		this.origin.copy( ray.origin );
		this.direction.copy( ray.direction );

		return this;

	},

	at: function( t, optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();

		return result.copy( this.direction ).multiplyScalar( t ).add( this.origin );

	},

	recast: function ( t ) {

		this.origin.copy( this.at( t, THREE.Ray.__v1 ) );

		return this;

	},

	closestPointToPoint: function ( point, optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();
		result.copy( point );
		result.sub( this.origin );
		var directionDistance = result.dot( this.direction );

		return result.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );

	},

	distanceToPoint: function ( point ) {

		var directionDistance = THREE.Ray.__v1.copy( point ).sub( this.origin ).dot( this.direction );		
		THREE.Ray.__v1.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );

		return THREE.Ray.__v1.distanceTo( point );

	},

	distanceToRay : function ( otherRay ) {
		var origin0 = this.origin;
		var direction0 = this.direction;
		var origin1 = otherRay.origin;
		var direction1 = otherRay.direction;
		
		var diffOrigins = origin1.clone().sub(origin0);
		var directionPerpendicular = direction0.clone().cross( direction1 );
		if( directionPerpendicular.length() == 0 ) { // direction0 is parallel to direction1
			return diffOrigins.cross( direction0 ).length() / direction0.length();  
		} else {
			// see e.g. http://nibis.ni.schule.de/~lbs-gym/Vektorpdf/windschiefeGeraden.pdf
			directionPerpendicular.normalize();
			directionPerpendicular.multiply( diffOrigins );
			return Math.abs(directionPerpendicular.x + directionPerpendicular.y + directionPerpendicular.z);
		}
	},

	isIntersectionSphere: function( sphere ) {

		return ( this.distanceToPoint( sphere.center ) <= sphere.radius );

	},

	isIntersectionPlane: function ( plane ) {

		// check if the line and plane are non-perpendicular, if they
		// eventually they will intersect.
		var denominator = plane.normal.dot( this.direction );
		if ( denominator != 0 ) {

			return true;

		}

		// line is coplanar, return origin
		if( plane.distanceToPoint( this.origin ) == 0 ) {

			return true;

		}

		return false;

	},

	distanceToPlane: function ( plane ) {

		var denominator = plane.normal.dot( this.direction );
		if ( denominator == 0 ) {

			// line is coplanar, return origin
			if( plane.distanceToPoint( this.origin ) == 0 ) {

				return 0;

			}

			// Unsure if this is the correct method to handle this case.
			return undefined;

		}

		var t = - ( this.origin.dot( plane.normal ) + plane.constant ) / denominator;

		return t;

	},

	intersectPlane: function ( plane, optionalTarget ) {

		var t = this.distanceToPlane( plane );

		if( t === undefined ) {

			return undefined;
		}

		return this.at( t, optionalTarget );

	},

	transform: function ( matrix4 ) {

		this.direction = this.direction.add( this.origin ).applyMatrix4( matrix4 );
		this.origin = this.origin.applyMatrix4( matrix4 );
		this.direction.sub( this.origin );

		return this;
	},

	equals: function ( ray ) {

		return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );

	},

	clone: function () {

		return new THREE.Ray().copy( this );

	}

};

THREE.Ray.__v1 = new THREE.Vector3();
THREE.Ray.__v2 = new THREE.Vector3();