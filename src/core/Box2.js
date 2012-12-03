/**
 * @author bhouston / http://exocortex.com
 */

THREE.Box2 = function ( min, max ) {

	if ( min === undefined && max === undefined ) {

		this.min = new THREE.Vector2();
		this.max = new THREE.Vector2();
		this.makeEmpty();

	} else {

		this.min = min || new THREE.Vector2();
		this.max = max || new THREE.Vector2().copy( this.min ); // This is done on purpose so you can make a box using a single point and then expand it.

	}

};

THREE.Box2.prototype = {

	constructor: THREE.Box2,

	set: function ( min, max ) {

		this.min = min;
		this.max = max;

		return this;
	},

	setFromPoints: function ( points ) {

		if ( points.length > 0 ) {

			var p = points[ 0 ];

			this.min.copy( p );
			this.max.copy( p );

			for ( var i = 1, il = points.length; i < il; i ++ ) {

				p = points[ i ];

				if ( p.x < this.min.x ) {

					this.min.x = p.x;

				} else if ( p.x > this.max.x ) {

					this.max.x = p.x;

				}

				if ( p.y < this.min.y ) {

					this.min.y = p.y;

				} else if ( p.y > this.max.y ) {

					this.max.y = p.y;

				}

			}

		} else {

			this.makeEmpty();

		}

		return this;

	},

	setFromCenterAndSize: function ( center, size ) {

		var halfSize = THREE.Box2.__v1.copy( size ).multiplyScalar( 0.5 );
		this.min.copy( center ).subSelf( halfSize );
		this.max.copy( center ).addSelf( halfSize );

		return this;

	},

	copy: function ( box ) {

		this.min.copy( box.min );
		this.max.copy( box.max );

		return this;

	},

	makeEmpty: function () {

		this.min.x = this.min.y = Infinity;
		this.max.x = this.max.y = -Infinity;

		return this;

	},

	empty: function () {

		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

		return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y );

	},

	volume: function () {

		return ( this.max.x - this.min.x ) * ( this.max.y - this.min.y );

	},

	center: function () {

		return new THREE.Vector2().add( this.min, this.max ).multiplyScalar( 0.5 );

	},

	size: function () {

		return new THREE.Vector2().sub( this.max, this.min );

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

		if ( ( this.min.x <= point.x ) && ( point.x <= this.max.x ) &&
			 ( this.min.y <= point.y ) && ( point.y <= this.max.y ) ) {

			return true;

		}

		return false;

	},

	containsBox: function ( box ) {

		if ( ( this.min.x <= box.min.x ) && ( box.max.x <= this.max.x ) &&
			 ( this.min.y <= box.min.y ) && ( box.max.y <= this.max.y ) ) {

			return true;

		}

		return false;

	},

	getParameter: function ( point ) {

		// This can potentially have a divide by zero if the box
		// has a size dimension of 0.

		return new THREE.Vector2(
			( point.x - this.min.x ) / ( this.max.x - this.min.x ),
			( point.y - this.min.y ) / ( this.max.y - this.min.y )
		);

	},

	isIntersection: function ( box ) {

		// using 6 splitting planes to rule out intersections.

		if ( ( this.max.x < box.min.x ) || ( box.min.x > this.max.x ) ||
			 ( this.max.y < box.min.y ) || ( box.min.y > this.max.y ) ) {

			return false;

		}

		return true;

	},

	clampPoint: function ( point ) {

		return new THREE.Vector2().copy( point ).clampSelf( this.min, this.max );

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

	},

	equals: function ( box ) {

		return box.min.equals( this.min ) && box.max.equals( this.max );

	},

	clone: function () {

		return new THREE.Box2().copy( this );

	}

};

THREE.Box2.__v1 = new THREE.Vector2();
