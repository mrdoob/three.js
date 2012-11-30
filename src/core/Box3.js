/**
 * @author Ben Houston / ben@exocortex.com / http://github.com/bhouston
 */

( function ( THREE ) {

	THREE.Box3 = function ( min, max ) {

		this.min = min || new THREE.Vector3();
		this.max = max || this.min;		// This is done on purpose so you can make a box using a single point and then expand it.

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


	THREE.Box3.prototype.empty = function () {
		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
		return 
			(( this.max.x - this.min.x ) <= 0 ) ||
			(( this.max.y - this.min.y ) <= 0 ) ||
			(( this.max.z - this.min.z ) <= 0 );
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

	THREE.Box3.prototype.extendByPoint = function ( point ) {
		this.min.minSelf( point );
		this.max.maxSelf( point );
		return this;
	};

	THREE.Box3.prototype.extendByBox = function ( box ) {
		// Assumption: for speed purposes, we assume that the box is not empty, e.g. box.min < box.max
		this.min.minSelf( box.min );
		this.max.maxSelf( box.max );
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
		// Assumption: for speed purposes, we assume that the box is not empty, e.g. box.min < box.max
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
		// Assumption: for speed purposes, we assume that the box is not empty, e.g. box.min < box.max
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
		// Assumption: for speed purposes, we assume that the box is not empty, e.g. box.min < box.max
		// This assumption can lead to a divide by zero if the box is actually empty.
		// Suggestions?  I don't want to check for empty as it is a speed hit, but maybe
		// it is necessary.
		return new THREE.Vector3(
			( point.x - this.min.x ) / ( this.max.x - this.min.x ),
			( point.y - this.min.y ) / ( this.max.y - this.min.y ),
			( point.z - this.min.z ) / ( this.max.z - this.min.z )
			);
	};

	THREE.Box3.prototype.clampPoint = function ( point ) {
		return point.maxSelf( this.min ).minSelf( this.max );
	};

	THREE.Box3.prototype.distanceToPoint = function ( point ) {
		return this.clampPoint( point ).subSelf( point ).length();
	};

	THREE.Box3.prototype.intersect = function ( box ) {
		// Assumption: for speed purposes, we assume that the box is not empty, e.g. box.min < box.max
		this.min = this.clampPoint( box.min );
		this.max = this.clampPoint( box.max );
		return this;
	};

	THREE.Box3.prototype.union = function ( box ) {
		// Assumption: for speed purposes, we assume that the box is not empty, e.g. box.min < box.max
		this.extendByPoint( box.min );
		this.extendByPoint( box.max );
		return this;
	};

	THREE.Box3.prototype.translate = function ( offset ) {
		this.min.addSelf( offset );
		this.max.addSelf( offset );
		return this;
	};

}( THREE ) );
