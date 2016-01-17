/**
 * @author xprogram / http://github.com/xprogram
 */

THREE.Cylinder = function( center, radius, height ){
	this.center = ( center !== undefined ) ? center : new THREE.Vector3();
	this.radius = ( radius !== undefined ) ? radius : -Infinity;
	this.height = ( height !== undefined ) ? height : -Infinity;
};

// Note that all this math is experimental, e.g. not really tested

THREE.Cylinder.prototype = {

	constructor: THREE.Cylinder,

	set: function( center, radius, height ) {
		
		this.center.copy( center );
		this.radius = radius;
		this.height = height;

		return this;
		
	},

	setFromPoints: function( points ) {

		this.makeEmpty();

		for( var i = 0, il = points.length; i < il; i++ ) {

			this.expandByPoint( points[i] );

		}

		return this;

	},

	setFromMinAndMax: function( min, max ) {

		// This function assumes min < max, if not it doesn't work properly

		this.radius = Math.sqrt( Math.pow( ( max.x - min.x ), 2 ) + Math.pow( ( max.z - min.z ), 2 ) ) * 0.5;
		this.height = max.y - min.y;

		return this;

	},

	clone: function() {

		return new this.constructor( this.center, this.radius, this.height );

	},

	copy: function( cylinder ) {

		this.center.copy( cylinder.center );
		this.radius = cylinder.radius;
		this.height = cylinder.height;

		return this;

	},

	makeEmpty: function() {

		this.radius = this.height = - Infinity;

		return this;

	},

	empty: function(){

		return this.radius <= 0 && this.height <= 0;

	},

	expandByPoint: function( point ) {

		var radius = Math.sqrt( Math.pow( ( point.x - this.center.x ), 2 ) + Math.pow( ( point.z - this.center.z ), 2 ) ) * 0.5;

		this.radius = Math.max( this.radius, radius );
		this.height = Math.max( this.height, point.y );

		return this;

	},

	expandByVector: function( vector ) {

		this.radius += Math.max( vector.x, vector.z );
		this.height += vector.y;

		return this;

	},

	expandByScalar: function( scalar ) {

		this.radius += scalar;
		this.height += scalar;

		return this;

	},

	containsPoint: function( point ) {

		var high = 0.5 * this.height + center.y;
		var low = high - this.height;
		var radius = Math.sqrt( Math.pow( ( point.x - this.center.x ), 2 ) + Math.pow( ( point.z - this.center.z ), 2 ) ) * 0.5;

		return radius <= this.radius && ( high >= point.y && low <= point.y );

	},

	containsSphere: function( sphere ) {

		var point = sphere.center;
		var total = this.radius + sphere.radius;
		var high = 0.5 * this.height + center.y;
		var low = high - this.height;
		var c1 = Math.sqrt( Math.pow( ( point.x - this.center.x ), 2 ) + Math.pow( ( point.z - this.center.z ), 2 ) ) * 0.5 <= total;
		var c2 = ( high >= point.y + sphere.radius && low <= point.y - sphere.radius );

		return c1 && c2;

	},

	volume: function() {

		return Math.PI * ( this.radius * this.radius ) * this.height;

	},

	translate: function( offset ) {

		this.center.add( offset );

		return this;

	},

	getSphere: function() {

		return new THREE.Sphere( this.center, this.radius + this.height );

	}
};
