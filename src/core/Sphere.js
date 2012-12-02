/**
 * @author bhouston / http://exocortex.com
 */

THREE.Sphere = function ( center, radius ) {

	this.center = center || new THREE.Vector3();
	this.radius = radius || 0;

};

THREE.Sphere.prototype = {

	constructor: THREE.Sphere,

	set: function ( center, radius ) {

		this.center = center;
		this.radius = radius;

		return this;
	},

	setFromCenterAndPoints: function ( center, points ) {

		var maxRadiusSq = 0;
		for ( var i = 0, numPoints = points.length; i < numPoints; i ++ ) {			
			var radiusSq = center.distanceToSquared( points[i] );
			maxRadiusSq = Math.max( maxRadiusSq, radiusSq );
		}

		this.center = center;
		this.radius = Math.sqrt( maxRadiusSq );

		return this;
	},

	copy: function ( sphere ) {

		this.center.copy( sphere.center );
		this.radius = sphere.radius.clone();

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

		var result = new THREE.Vector3().copy( point );

		if( deltaLengthSq > ( this.radius * this.radius ) ) {

			result.subSelf( center ).normalize();
			result.multiplyScalar( this.radius ).addSelf( this.center );
		}

		return result;
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
