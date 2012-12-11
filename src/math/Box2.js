/**
 * @author bhouston / http://exocortex.com
 */

THREE.Box2 = function ( min, max ) {

	this.min = min !== undefined ? min.clone() : new THREE.Vector2( Infinity, Infinity );
	this.max = max !== undefined ? max.clone() : new THREE.Vector2( -Infinity, -Infinity );

};

THREE.Box2.prototype = {

	constructor: THREE.Box2,

	set: function ( min, max ) {

		this.min.copy( min );
		this.max.copy( max );

		return this;

	},

	setFromPoints: function ( points ) {

		if ( points.length > 0 ) {

			var point = points[ 0 ];

			this.min.copy( point );
			this.max.copy( point );

			for ( var i = 1, il = points.length; i < il; i ++ ) {

				point = points[ i ];

				if ( point.x < this.min.x ) {

					this.min.x = point.x;

				} else if ( point.x > this.max.x ) {

					this.max.x = point.x;

				}

				if ( point.y < this.min.y ) {

					this.min.y = point.y;

				} else if ( point.y > this.max.y ) {

					this.max.y = point.y;

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

	center: function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Vector2();
		return result.add( this.min, this.max ).multiplyScalar( 0.5 );

	},

	size: function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Vector2();
		return result.sub( this.max, this.min );

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

	isIntersectionBox: function ( box ) {

		// using 6 splitting planes to rule out intersections.

		if ( ( box.max.x < this.min.x ) ||
		     ( box.min.x > this.max.x ) ||
		     ( box.max.y < this.min.y ) ||
		     ( box.min.y > this.max.y ) ) {

			return false;

		}

		return true;

	},

	clampPoint: function ( point, optionalTarget ) {

		var result = optionalTarget || new THREE.Vector2();
		return result.copy( point ).clampSelf( this.min, this.max );

	},

	distanceToPoint: function ( point ) {

		var clampedPoint = THREE.Box2.__v1.copy( point ).clampSelf( this.min, this.max );
		return clampedPoint.subSelf( point ).length();

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

	equals: function ( box ) {

		return box.min.equals( this.min ) && box.max.equals( this.max );

	},

	clone: function () {

		return new THREE.Box2().copy( this );

	}

};

THREE.Box2.__v1 = new THREE.Vector2();
