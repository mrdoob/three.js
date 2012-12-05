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

THREE.Triangle3.prototype = {

	constructor: THREE.Triangle3,

	set: function ( a, b, c ) {

		this.a.copy( a );
		this.b.copy( b );
		this.c.copy( c );

		return this;

	},

	setPointsAndIndices: function ( points, i0, i1, i2 ) {

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

		__v0.sub( this.c, this.b );
		__v1.sub( this.a, this.b );

		return __v0.cross( __v1 ).length() * 0.5;

	},

	midpoint: function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();
		return result.add( this.a, this.b ).addSelf( this.b ).multiplyScalar( 1 / 3 );

	},

	normal: function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();

		result.sub( this.c, this.b );
		__v0.sub( this.a, this.b );
		result.cross( __v0 );

		var resultLengthSq = result.lengthSq();
		if( resultLengthSq > 0 ) {

			return result.multiplyScalar( 1 / resultLengthSq );

		}

		// It is usually best to return a non-zero normal, even if it is made up, to avoid
		// special case code to handle zero-length normals.
		return result.set( 1, 0, 0 );

	},

	plane: function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Plane();

		return result.setFromCoplanarPoints( this.a, this.b, this.c );

	},

	containsPoint: function ( point ) {

		__v0.sub( c, a );
		__v1.sub( b, a );
		__v2.sub( point, a );

		var dot00 = __v0.dot( __v0 );
		var dot01 = __v0.dot( __v1 );
		var dot02 = __v0.dot( __v2 );
		var dot11 = __v1.dot( __v1 );
		var dot12 = __v1.dot( __v2 );

		var invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 );
		var u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
		var v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

		return ( u >= 0 ) && ( v >= 0 ) && ( u + v < 1 );

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
