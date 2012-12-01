/**
 * @author Ben Houston / ben@exocortex.com / http://github.com/bhouston
 */

( function ( THREE ) {

	var sphereVolumeConstant = Math.PI * 4 / 3;
	var square = function( x ) { return x*x; }
	var cube = function( x ) { return x*x*x; }

	THREE.Sphere = function ( center, radius ) {

		this.center = center || new THREE.Vector3();
		this.radius = radius || 0;

	};

	THREE.Sphere.fromCenterAndPoints = function ( center, points ) {

		var maxRadiusSq = 0;
		for ( var i = 0, numPoints = points.length; i < numPoints; i ++ ) {			
			var radiusSq = center.distanceToSquared( points[i] );
			maxRadiusSq = Math.max( maxRadiusSq, radiusSq );
		}

		return new THREE.Sphere( center, Math.sqrt( maxRadiusSq ) );
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

		return sphereVolumeConstant * cube( this.radius );
	};

	THREE.Sphere.prototype.containsPoint = function ( point ) {

		return ( point.distanceToSquared( this.center ) <= square( this.radius ) );
	};

	THREE.Sphere.prototype.distanceToPoint = function ( point ) {

		return ( point.distanceTo( this.center ) - this.radius );
	};

	THREE.Sphere.prototype.clampPoint = function ( point ) {

		var deltaLengthSq = this.center.distanceToSquared( point );

		if( deltaLengthSq > square( this.radius ) ) {

			var delta = new THREE.Vector3().sub( point, center ).normalize();
			delta.multiplyScalar( this.radius ).addSelf( this.center );

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

	THREE.Sphere.prototype.scale = function ( factor ) {

		this.radius *= factor;
		
		return this;
	};

}( THREE ) );
