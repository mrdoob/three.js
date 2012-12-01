/**
 * @author Ben Houston / ben@exocortex.com / http://github.com/bhouston
 */

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

THREE.Sphere.prototype = {

	constructor: THREE.Sphere,

	set: function ( center, radius ) {

		this.center = center;
		this.radius = radius;

		return this;
	},

	copy: function ( sphere ) {

		this.center = sphere.center;
		this.radius = sphere.radius;

		return this;
	},

	empty: function () {

		return ( this.radius <= 0 );
	},

	volume: function () {

		return Math.PI * 4 / 3 * ( this.radius * this.radius * this.radius );
	},

	containsPoint: function ( point ) {

		return ( point.distanceToSquared( this.center ) <= ( this.radius * this.radius ) );
	},

	distanceToPoint: function ( point ) {

		return ( point.distanceTo( this.center ) - this.radius );
	},

	clampPoint: function ( point ) {

		var deltaLengthSq = this.center.distanceToSquared( point );

		if( deltaLengthSq > ( this.radius * this.radius ) ) {

			var delta = new THREE.Vector3().sub( point, center ).normalize();
			delta.multiplyScalar( this.radius ).addSelf( this.center );

			return delta;
		}

		return point;
	},

	bounds: function () {

		var box =  new THREE.Box3( this.center, this.center );
		box.expandByScalar( this.radius );

		return box;
	},

	translate: function ( offset ) {

		this.center.addSelf( this.offset );
		
		return this;
	},

	scale: function ( factor ) {

		this.radius *= factor;
		
		return this;
	}

};
