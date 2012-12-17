/**
 * @author bhouston / http://exocortex.com
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Sphere = function ( center, radius ) {

	this.center = center === undefined ? new THREE.Vector3() : center.clone();
	this.radius = radius === undefined ? 0 : radius;

};

THREE.Sphere.prototype = {

	constructor: THREE.Sphere,

	set: function ( center, radius ) {

		this.center.copy( center );
		this.radius = radius;

		return this;
	},

	setFromCenterAndPoints: function ( center, points ) {

		var maxRadiusSq = 0;

		for ( var i = 0, il = points.length; i < il; i ++ ) {

			var radiusSq = center.distanceToSquared( points[ i ] );
			maxRadiusSq = Math.max( maxRadiusSq, radiusSq );

		}

		this.center = center;
		this.radius = Math.sqrt( maxRadiusSq );

		return this;

	},

	copy: function ( sphere ) {

		this.center.copy( sphere.center );
		this.radius = sphere.radius;

		return this;

	},

	empty: function () {

		return ( this.radius <= 0 );

	},

	containsPoint: function ( point ) {

		return ( point.distanceToSquared( this.center ) <= ( this.radius * this.radius ) );

	},

	distanceToPoint: function ( point ) {

		return ( point.distanceTo( this.center ) - this.radius );

	},

	clampPoint: function ( point, optionalTarget ) {

		var deltaLengthSq = this.center.distanceToSquared( point );

		var result = optionalTarget || new THREE.Vector3();
		result.copy( point );

		if ( deltaLengthSq > ( this.radius * this.radius ) ) {

			result.subSelf( this.center ).normalize();
			result.multiplyScalar( this.radius ).addSelf( this.center );

		}

		return result;

	},

	getBoundingBox: function ( optionalTarget ) {

		var box = optionalTarget || new THREE.Box3();

		box.set( this.center, this.center );
		box.expandByScalar( this.radius );

		return box;

	},

	transform: function ( matrix ) {
		
		this.center = matrix.multiplyVector3( this.center );
		this.radius = this.radius * matrix.getMaxScaleOnAxis();

		return this;

	},

	translate: function ( offset ) {

		this.center.addSelf( offset );

		return this;

	},

	equals: function ( sphere ) {

		return sphere.center.equals( this.center ) && ( sphere.radius === this.radius );

	},

	clone: function () {

		return new THREE.Sphere().copy( this );

	}

};
