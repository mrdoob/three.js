/**
 * @author Ben Houston / ben@exocortex.com / http://github.com/bhouston
 */

( function ( THREE ) {

	THREE.Sphere = function ( center, radius ) {

		this.center = center || new THREE.Vector3();
		this.radius = radius || 0;

	};

	THREE.Sphere.prototype.set = function ( center, radius ) {

		this.center = center;
		this.radius = radius;

		return this;
	};

	THREE.Sphere.prototype.copy = function ( sphere ) {

		this.center = sphere.center;
		this.radius = sphere.radius;

		return this;
	};


	THREE.Sphere.prototype.empty = function () {

		return ( this.radius <= 0 );

	};


	THREE.Sphere.prototype.volume = function () {

		return Math.PI * 4 / 3 * this.radius * this.radius * this.radius;

	};

	THREE.Sphere.prototype.containsPoint = function ( point ) {

		var distanceSq = new THREE.VEctor3().sub( point, this.center ).lengthSq();

		return ( distanceSq <= this.radius * this.radius );
	};

	THREE.Sphere.prototype.distanceToPoint = function ( point ) {

		var distanceSq = new THREE.Vector3().sub( point, this.center ).length();

		return ( distanceSq - this.radius );
	};

	THREE.Sphere.prototype.clampPoint = function ( point ) {

		// NOTE: There is likely a more optimal way of doing this.

		var delta = new THREE.Vector3().sub( point, this.center );

		var deltaLengthSq = delta.lengthSq();

		if( deltaLengthSq > ( this.radius*this.radius ) ) {

			delta.normalize().multiplyByScalar( this.radius ).addSelf( this.center );
			return delta;

		}

		return point;
	};

	THREE.Sphere.prototype.bounds = function () {

		var box =  new THREE.Box3( this.center, this.center );
		box.expandByScalar( this.radius );

		return box;
	};

	THREE.Sphere.prototype.translate = function ( offset ) {

		this.center.addSelf( this.offset );
		
		return this;
	};

}( THREE ) );
