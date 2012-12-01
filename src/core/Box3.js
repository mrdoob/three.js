/**
 * @author Ben Houston / ben@exocortex.com / http://github.com/bhouston
 */

( function ( THREE ) {

	THREE.Box3 = function ( min, max ) {

		// TODO: Is this valid JavaScript to check if the parameters are specified?
		if( ! min && ! max ) {			
			this.makeEmpty();
		}
		else {
			this.min = min || new THREE.Vector3();
			this.max = max || this.min;		// This is done on purpose so you can make a box using a single point and then expand it.
		}
	};

	THREE.Box3.fromPoints = function ( points ) {

		var boundingBox = new THREE.Box3();
		for( var i = 0, numPoints = points.length; i < numPoints; i ++ ) {
			boundingBox.extendByPoint( points[i] );
		}

		return boundingBox;
	};

	THREE.Box3.fromCenterAndSize = function ( center, size ) {

		var halfSize = new THREE.Vector3().copy( size ).multiplyScalar( 0.5 );
		var box = new THREE.Box3( center, center );
		box.min.subSelf( halfSize );
		box.min.addSelf( halfSize );

		return box;	
	};

	THREE.Box3.prototype.set = function ( min, max ) {

		this.min = min;
		this.max = max;

		return this;
	};

	THREE.Box3.prototype.copy = function ( box ) {

		this.min = box.min;
		this.max = box.max;

		return this;
	};

	THREE.Box3.prototype.makeEmpty = function () {

		this.min.x = this.min.y = this.min.z = Number.MAX_VALUE;
		this.max.x = this.max.y = this.max.z = -Number.MAX_VALUE;

		return this;
	};

	THREE.Box3.prototype.empty = function () {

		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
		return 
			( this.max.x < this.min.x ) ||
			( this.max.y < this.min.y ) ||
			( this.max.z < this.min.z );
	};

	THREE.Box3.prototype.volume = function () {

		return 
			( this.max.x - this.min.x ) *
			( this.max.y - this.min.y ) *
			( this.max.z - this.min.z );
	};

	THREE.Box3.prototype.center = function () {

		return new THREE.Vector3().add( this.min, this.max ).multiplyScalar( 0.5 );
	};

	THREE.Box3.prototype.size = function () {

		return new THREE.Vector3().sub( this.max, this.min );
	};

	THREE.Box3.prototype.expandByPoint = function ( point ) {

		this.min.minSelf( point );		
		this.max.maxSelf( point );

		return this;
	};

	THREE.Box3.prototype.expandByVector = function ( vector ) {

		this.min.subSelf( vector );
		this.max.addSelf( vector );

		return this;
	};

	THREE.Box3.prototype.expandByScalar = function ( scalar ) {

		this.min.addScalar( -scalar );
		this.max.addScalar( scalar );
		
		return this;
	};

	THREE.Box3.prototype.containsPoint = function ( point ) {
		if( 
			( this.min.x <= point.x ) && ( point.x <= this.max.x ) &&
			( this.min.y <= point.y ) && ( point.y <= this.max.y ) &&
			( this.min.z <= point.z ) && ( point.z <= this.max.z )
			) {
			return true;
		}
		return false;
	};

	THREE.Box3.prototype.containsBox = function ( box ) {
		if( 
			( this.min.x <= box.min.x ) && ( box.max.x <= this.max.x ) &&
			( this.min.y <= box.min.y ) && ( box.max.y <= this.max.y ) &&
			( this.min.z <= box.min.z ) && ( box.max.z <= this.max.z )
			) {
			return true;
		}
		return false;
	};

	THREE.Box3.prototype.isIntersection = function ( box ) {
		// using 6 splitting planes to rule out intersections.
		if( 
			( this.max.x < box.min.x ) || ( box.min.x > this.max.x ) ||
			( this.max.y < box.min.y ) || ( box.min.y > this.max.y ) ||
			( this.max.z < box.min.z ) || ( box.min.z > this.max.z )
			) {
			return false;
		}
		return true;
	};

	THREE.Box3.prototype.getParameter = function ( point ) {
		// This can potentially have a divide by zero if the box
		// has a size dimension of 0.
		return new THREE.Vector3(
			( point.x - this.min.x ) / ( this.max.x - this.min.x ),
			( point.y - this.min.y ) / ( this.max.y - this.min.y ),
			( point.z - this.min.z ) / ( this.max.z - this.min.z )
			);
	};

	THREE.Box3.prototype.clampPoint = function ( point ) {

		return new THREE.Vector3().copy( point ).maxSelf( this.min ).minSelf( this.max );
	};

	THREE.Box3.prototype.distanceToPoint = function ( point ) {

		return this.clampPoint( point ).subSelf( point ).length();
	};

	THREE.Box3.prototype.intersect = function ( box ) {

		this.min.maxSelf( box.min );
		this.max.minSelf( box.max );
		
		return this;
	};

	THREE.Box3.prototype.union = function ( box ) {

		this.min.minSelf( box.min );
		this.max.maxSelf( box.max );

		return this;
	};

	THREE.Box3.prototype.translate = function ( offset ) {

		this.min.addSelf( offset );
		this.max.addSelf( offset );

		return this;
	};

	THREE.Box3.prototype.scale = function ( factor ) {

		var sizeDeltaHalf = this.size().multiplyScalar( ( 1 - factor )  * 0.5 );
		this.expandByVector( sizeDeltaHalf );

		return this;
	};

}( THREE ) );
