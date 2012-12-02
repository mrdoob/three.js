/**
 * @author bhouston / http://exocortex.com
 */

THREE.Box3 = function ( min, max ) {

	if( ! min && ! max ) {			
		this.min = new THREE.Vector3();
		this.max = new THREE.Vector3();
		this.makeEmpty();
	}
	else {
		this.min = min || new THREE.Vector3();
		this.max = max || new THREE.Vector3().copy( this.min );		// This is done on purpose so you can make a box using a single point and then expand it.
	}
};

THREE.Box3.prototype = {

	constructor: THREE.Box3,

	set: function ( min, max ) {

		this.min = min;
		this.max = max;

		return this;
	},

	setFromPoints: function ( points ) {

		if( points.length > 0 ) {

			var p = points[0];
			this.min.copy( p );
			this.max.copy( p );

			for( var i = 1, numPoints = points.length; i < numPoints; i ++ ) {

				p = points[ v ];

				if ( p.x < this.min.x ) {
					this.min.x = p.x;
				}
				else if ( p.x > this.max.x ) {
					this.max.x = p.x;
				}

				if ( p.y < this.min.y ) {
					this.min.y = p.y;
				}
				else if ( p.y > this.max.y ) {
					this.max.y = p.y;
				}

				if ( p.z < this.min.z ) {
					this.min.z = p.z;
				}
				else if ( p.z > this.max.z ) {
					this.max.z = p.z;
				}
			}
		}
		else {
			this.makeEmpty();
		}

		return this;
	},

	setFromCenterAndSize: function ( center, size ) {

		var halfSize = THREE.Box3.__v1.copy( size ).multiplyScalar( 0.5 );
		this.min.copy( center ).subSelf( halfSize );
		this.max.copy( center ).addSelf( halfSize );

		return box;	
	},

	copy: function ( box ) {

		this.min.copy( box.min );
		this.max.copy( box.max );

		return this;
	},

	makeEmpty: function () {

		this.min.x = this.min.y = this.min.z = Number.MAX_VALUE;
		this.max.x = this.max.y = this.max.z = -Number.MAX_VALUE;

		return this;
	},

	empty: function () {

		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
		return 
			( this.max.x < this.min.x ) ||
			( this.max.y < this.min.y ) ||
			( this.max.z < this.min.z );
	},

	volume: function () {

		return 
			( this.max.x - this.min.x ) *
			( this.max.y - this.min.y ) *
			( this.max.z - this.min.z );
	},

	center: function () {

		return new THREE.Vector3().add( this.min, this.max ).multiplyScalar( 0.5 );
	},

	size: function () {

		return new THREE.Vector3().sub( this.max, this.min );
	},

	expandByPoint: function ( point ) {

		this.min.minSelf( point );		
		this.max.maxSelf( point );

		return this;
	},

	expandByVector: function ( vector ) {

		this.min.subSelf( vector );
		this.max.addSelf( vector );

		return this;
	},

	expandByScalar: function ( scalar ) {

		this.min.addScalar( -scalar );
		this.max.addScalar( scalar );
		
		return this;
	},

	containsPoint: function ( point ) {
		if( 
			( this.min.x <= point.x ) && ( point.x <= this.max.x ) &&
			( this.min.y <= point.y ) && ( point.y <= this.max.y ) &&
			( this.min.z <= point.z ) && ( point.z <= this.max.z )
			) {
			return true;
		}
		return false;
	},

	containsBox: function ( box ) {
		if( 
			( this.min.x <= box.min.x ) && ( box.max.x <= this.max.x ) &&
			( this.min.y <= box.min.y ) && ( box.max.y <= this.max.y ) &&
			( this.min.z <= box.min.z ) && ( box.max.z <= this.max.z )
			) {
			return true;
		}
		return false;
	},

	isIntersection: function ( box ) {
		// using 6 splitting planes to rule out intersections.
		if( 
			( this.max.x < box.min.x ) || ( box.min.x > this.max.x ) ||
			( this.max.y < box.min.y ) || ( box.min.y > this.max.y ) ||
			( this.max.z < box.min.z ) || ( box.min.z > this.max.z )
			) {
			return false;
		}
		return true;
	},

	getParameter: function ( point ) {
		// This can potentially have a divide by zero if the box
		// has a size dimension of 0.
		return new THREE.Vector3(
			( point.x - this.min.x ) / ( this.max.x - this.min.x ),
			( point.y - this.min.y ) / ( this.max.y - this.min.y ),
			( point.z - this.min.z ) / ( this.max.z - this.min.z )
			);
	},

	clampPoint: function ( point ) {

		var p = new THREE.Vector3().copy( point );

		// this requires less if's then a point.minSelf( this.max ).maxSelf( this.min )
		if( p.x < this.min.x ) {
			p.x = this.min.x;
		}
		else if( p.x > this.max.x ) {
			p.x = this.max.x;
		}

		if( p.y < this.min.y ) {
			p.y = this.min.y;
		}
		else if( p.y > this.max.y ) {
			p.y = this.max.y;
		}

		if( p.z < this.min.z ) {
			p.z = this.min.z;
		}
		else if( p.z > this.max.z ) {
			p.z = this.max.z;
		}

		return p;
	},

	distanceToPoint: function ( point ) {

		return this.clampPoint( point ).subSelf( point ).length();
	},

	intersect: function ( box ) {

		this.min.maxSelf( box.min );
		this.max.minSelf( box.max );
		
		return this;
	},

	union: function ( box ) {

		this.min.minSelf( box.min );
		this.max.maxSelf( box.max );

		return this;
	},

	translate: function ( offset ) {

		this.min.addSelf( offset );
		this.max.addSelf( offset );

		return this;
	},

	scale: function ( factor ) {

		var sizeDeltaHalf = this.size().multiplyScalar( ( 1 - factor )  * 0.5 );
		this.expandByVector( sizeDeltaHalf );

		return this;
	}
	
};

THREE.Box3.__v1 = new THREE.Vector3();