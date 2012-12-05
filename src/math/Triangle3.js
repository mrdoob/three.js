/**
 * @author bhouston / http://exocortex.com
 */

THREE.Triangle3 = function ( a, b, c ) {

	this.a = new THREE.Vector3();
	this.b = new THREE.Vector3();
	this.c = new THREE.Vector3();

	if( a !== undefined && b !== undefined && c !== undefined ) {

		this.a.copy( a );
		this.b.copy( b );
		this.c.copy( c );

	}

};

// static/instance method to calculate barycoordinates
THREE.Triangle3.barycoordFromPoint = function ( point, a, b, c, optionalTarget ) {

	THREE.Triangle3.__v0.sub( c, a );
	THREE.Triangle3.__v1.sub( b, a );
	THREE.Triangle3.__v2.sub( point, a );

	var dot00 = THREE.Triangle3.__v0.dot( THREE.Triangle3.__v0 );
	var dot01 = THREE.Triangle3.__v0.dot( THREE.Triangle3.__v1 );
	var dot02 = THREE.Triangle3.__v0.dot( THREE.Triangle3.__v2 );
	var dot11 = THREE.Triangle3.__v1.dot( THREE.Triangle3.__v1 );
	var dot12 = THREE.Triangle3.__v1.dot( THREE.Triangle3.__v2 );

	var denom = ( dot00 * dot11 - dot01 * dot01 );

	var result = optionalTarget || new THREE.Vector3();

	// colinear or singular triangle
	if( denom == 0 ) {
		// arbitrary location outside of triangle?
		// not sure if this is the best idea, maybe should be returning undefined
		return result.set( -2, -1, -1 );
	}

	var invDenom = 1 / denom;
	var u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
	var v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

	// barycoordinates must always sum to 1
	return result.set( 1 - u - v, v, u );
}

THREE.Triangle3.containsPoint = function ( point, a, b, c ) {

	var result = THREE.Triangle3.barycoordFromPoint( point, a, b, c, THREE.Triangle3.__v3 );

	return ( result.x >= 0 ) && ( result.y >= 0 ) && ( ( result.x + result.y ) <= 1 );
}

THREE.Triangle3.prototype = {

	constructor: THREE.Triangle3,

	set: function ( a, b, c ) {

		this.a.copy( a );
		this.b.copy( b );
		this.c.copy( c );

		return this;

	},

	setFromPointsAndIndices: function ( points, i0, i1, i2 ) {

		this.a.copy( points[i0] );
		this.b.copy( points[i1] );
		this.c.copy( points[i2] );

		return this;

	},

	copy: function ( triangle ) {

		this.a.copy( triangle.a );
		this.b.copy( triangle.b );
		this.c.copy( triangle.c );

		return this;

	},

	area: function () {

		THREE.Triangle3.__v0.sub( this.c, this.b );
		THREE.Triangle3.__v1.sub( this.a, this.b );

		return THREE.Triangle3.__v0.crossSelf( THREE.Triangle3.__v1 ).length() * 0.5;

	},

	midpoint: function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();
		return result.add( this.a, this.b ).addSelf( this.c ).multiplyScalar( 1 / 3 );

	},

	normal: function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();

		result.sub( this.c, this.b );
		THREE.Triangle3.__v0.sub( this.a, this.b );
		result.crossSelf( THREE.Triangle3.__v0 );

		var resultLengthSq = result.lengthSq();
		if( resultLengthSq > 0 ) {

			return result.multiplyScalar( 1 / Math.sqrt( resultLengthSq ) );

		}

		return result.set( 0, 0, 0 );

	},

	plane: function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Plane();

		return result.setFromCoplanarPoints( this.a, this.b, this.c );

	},

	barycoordFromPoint: function ( point, optionalTarget ) {

		return THREE.Triangle3.barycoordFromPoint( point, this.a, this.b, this.c, optionalTarget );

	},

	containsPoint: function ( point ) {

		return THREE.Triangle3.containsPoint( point, this.a, this.b, this.c );

	},

	equals: function ( triangle ) {

		return triangle.a.equals( this.a ) && triangle.b.equals( this.b ) && triangle.c.equals( this.c );

	},

	clone: function () {

		return new THREE.Triangle3().copy( this );

	}

};

THREE.Triangle3.__v0 = new THREE.Vector3();
THREE.Triangle3.__v1 = new THREE.Vector3();
THREE.Triangle3.__v2 = new THREE.Vector3();
THREE.Triangle3.__v3 = new THREE.Vector3();
