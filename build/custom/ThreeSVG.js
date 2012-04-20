<<<<<<< HEAD
/**
 * @author mr.doob / http://mrdoob.com/
 */

var THREE = THREE || { REVISION: '49dev' };

if ( ! self.Int32Array ) {

	self.Int32Array = Array;
	self.Float32Array = Array;

}

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

( function () {

	var lastTime = 0;
	var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

	for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {

		window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
		window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];

	}

	if ( !window.requestAnimationFrame ) {

		window.requestAnimationFrame = function ( callback, element ) {

			var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
			lastTime = currTime + timeToCall;
			return id;

		};

	}


	if ( !window.cancelAnimationFrame ) {

		window.cancelAnimationFrame = function ( id ) { clearTimeout( id ); };

	}

}() );
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Color = function ( hex ) {

	if ( hex !== undefined ) this.setHex( hex );
	return this;

};

THREE.Color.prototype = {

	constructor: THREE.Color,

	r: 1, g: 1, b: 1,

	copy: function ( color ) {

		this.r = color.r;
		this.g = color.g;
		this.b = color.b;

		return this;

	},

	copyGammaToLinear: function ( color ) {

		this.r = color.r * color.r;
		this.g = color.g * color.g;
		this.b = color.b * color.b;

		return this;

	},

	copyLinearToGamma: function ( color ) {

		this.r = Math.sqrt( color.r );
		this.g = Math.sqrt( color.g );
		this.b = Math.sqrt( color.b );

		return this;

	},

	convertGammaToLinear: function () {

		var r = this.r, g = this.g, b = this.b;

		this.r = r * r;
		this.g = g * g;
		this.b = b * b;

		return this;

	},

	convertLinearToGamma: function () {

		this.r = Math.sqrt( this.r );
		this.g = Math.sqrt( this.g );
		this.b = Math.sqrt( this.b );

		return this;

	},

	setRGB: function ( r, g, b ) {

		this.r = r;
		this.g = g;
		this.b = b;

		return this;

	},

	setHSV: function ( h, s, v ) {

		// based on MochiKit implementation by Bob Ippolito
		// h,s,v ranges are < 0.0 - 1.0 >

		var i, f, p, q, t;

		if ( v === 0 ) {

			this.r = this.g = this.b = 0;

		} else {

			i = Math.floor( h * 6 );
			f = ( h * 6 ) - i;
			p = v * ( 1 - s );
			q = v * ( 1 - ( s * f ) );
			t = v * ( 1 - ( s * ( 1 - f ) ) );

			switch ( i ) {

				case 1: this.r = q; this.g = v; this.b = p; break;
				case 2: this.r = p; this.g = v; this.b = t; break;
				case 3: this.r = p; this.g = q; this.b = v; break;
				case 4: this.r = t; this.g = p; this.b = v; break;
				case 5: this.r = v; this.g = p; this.b = q; break;
				case 6: // fall through
				case 0: this.r = v; this.g = t; this.b = p; break;

			}

		}

		return this;

	},

	setHex: function ( hex ) {

		hex = Math.floor( hex );

		this.r = ( hex >> 16 & 255 ) / 255;
		this.g = ( hex >> 8 & 255 ) / 255;
		this.b = ( hex & 255 ) / 255;

		return this;

	},

	lerpSelf: function ( color, alpha ) {

		this.r += ( color.r - this.r ) * alpha;
		this.g += ( color.g - this.g ) * alpha;
		this.b += ( color.b - this.b ) * alpha;

		return this;

	},

	getHex: function () {

		return Math.floor( this.r * 255 ) << 16 ^ Math.floor( this.g * 255 ) << 8 ^ Math.floor( this.b * 255 );

	},

	getContextStyle: function () {

		return 'rgb(' + Math.floor( this.r * 255 ) + ',' + Math.floor( this.g * 255 ) + ',' + Math.floor( this.b * 255 ) + ')';

	},

	clone: function () {

		return new THREE.Color().setRGB( this.r, this.g, this.b );

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author philogb / http://blog.thejit.org/
 * @author egraether / http://egraether.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 */

THREE.Vector2 = function ( x, y ) {

	this.x = x || 0;
	this.y = y || 0;

};

THREE.Vector2.prototype = {

	constructor: THREE.Vector2,

	set: function ( x, y ) {

		this.x = x;
		this.y = y;

		return this;

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;

		return this;

	},

	add: function ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;

		return this;

	},

	addSelf: function ( v ) {

		this.x += v.x;
		this.y += v.y;

		return this;

	},

	sub: function ( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;

		return this;

	},

	subSelf: function ( v ) {

		this.x -= v.x;
		this.y -= v.y;

		return this;

	},

	multiplyScalar: function ( s ) {

		this.x *= s;
		this.y *= s;

		return this;

	},

	divideScalar: function ( s ) {

		if ( s ) {

			this.x /= s;
			this.y /= s;

		} else {

			this.set( 0, 0 );

		}

		return this;

	},

	negate: function() {

		return this.multiplyScalar( - 1 );

	},

	dot: function ( v ) {

		return this.x * v.x + this.y * v.y;

	},

	lengthSq: function () {

		return this.x * this.x + this.y * this.y;

	},

	length: function () {

		return Math.sqrt( this.lengthSq() );

	},

	normalize: function () {

		return this.divideScalar( this.length() );

	},

	distanceTo: function ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	},

	distanceToSquared: function ( v ) {

		var dx = this.x - v.x, dy = this.y - v.y;
		return dx * dx + dy * dy;

	},

	setLength: function ( l ) {

		return this.normalize().multiplyScalar( l );

	},

	lerpSelf: function ( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;

		return this;

	},

	equals: function( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) );

	},

	isZero: function () {

		return ( this.lengthSq() < 0.0001 /* almostZero */ );

	},

	clone: function () {

		return new THREE.Vector2( this.x, this.y );

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 */

THREE.Vector3 = function ( x, y, z ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;

};


THREE.Vector3.prototype = {

	constructor: THREE.Vector3,

	set: function ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	},

	setX: function ( x ) {

		this.x = x;

		return this;

	},

	setY: function ( y ) {

		this.y = y;

		return this;

	},

	setZ: function ( z ) {

		this.z = z;

		return this;

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	},

	add: function ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	},

	addSelf: function ( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	},

	addScalar: function ( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	},

	sub: function ( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	},

	subSelf: function ( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	},

	multiply: function ( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	},

	multiplySelf: function ( v ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	},

	multiplyScalar: function ( s ) {

		this.x *= s;
		this.y *= s;
		this.z *= s;

		return this;

	},

	divideSelf: function ( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	},

	divideScalar: function ( s ) {

		if ( s ) {

			this.x /= s;
			this.y /= s;
			this.z /= s;

		} else {

			this.x = 0;
			this.y = 0;
			this.z = 0;

		}

		return this;

	},


	negate: function() {

		return this.multiplyScalar( - 1 );

	},

	dot: function ( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	},

	lengthSq: function () {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	},

	length: function () {

		return Math.sqrt( this.lengthSq() );

	},

	lengthManhattan: function () {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	},

	normalize: function () {

		return this.divideScalar( this.length() );

	},

	setLength: function ( l ) {

		return this.normalize().multiplyScalar( l );

	},

	lerpSelf: function ( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;

		return this;

	},

	cross: function ( a, b ) {

		this.x = a.y * b.z - a.z * b.y;
		this.y = a.z * b.x - a.x * b.z;
		this.z = a.x * b.y - a.y * b.x;

		return this;

	},

	crossSelf: function ( v ) {

		var x = this.x, y = this.y, z = this.z;

		this.x = y * v.z - z * v.y;
		this.y = z * v.x - x * v.z;
		this.z = x * v.y - y * v.x;

		return this;

	},

	distanceTo: function ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	},

	distanceToSquared: function ( v ) {

		return new THREE.Vector3().sub( this, v ).lengthSq();

	},

	getPositionFromMatrix: function ( m ) {

		this.x = m.elements[12];
		this.y = m.elements[13];
		this.z = m.elements[14];

		return this;

	},

	getRotationFromMatrix: function ( m, scale ) {

		var sx = scale ? scale.x : 1;
		var sy = scale ? scale.y : 1;
		var sz = scale ? scale.z : 1;

		var m11 = m.elements[0] / sx, m12 = m.elements[4] / sy, m13 = m.elements[8] / sz;
		var m21 = m.elements[1] / sx, m22 = m.elements[5] / sy, m23 = m.elements[9] / sz;
		var m33 = m.elements[10] / sz;

		this.y = Math.asin( m13 );

		var cosY = Math.cos( this.y );

		if ( Math.abs( cosY ) > 0.00001 ) {

			this.x = Math.atan2( - m23 / cosY, m33 / cosY );
			this.z = Math.atan2( - m12 / cosY, m11 / cosY );

		} else {

			this.x = 0;
			this.z = Math.atan2( m21, m22 );

		}

		return this;

	},

	/*

	// from http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m
	// order XYZ

	getEulerXYZFromQuaternion: function ( q ) {

		this.x = Math.atan2( 2 * ( q.x * q.w - q.y * q.z ), ( q.w * q.w - q.x * q.x - q.y * q.y + q.z * q.z ) );
		this.y = Math.asin( 2 *  ( q.x * q.z + q.y * q.w ) );
		this.z = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( q.w * q.w + q.x * q.x - q.y * q.y - q.z * q.z ) );

	},

	// from http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToEuler/index.htm
	// order YZX (assuming heading == y, attitude == z, bank == x)

	getEulerYZXFromQuaternion: function ( q ) {

		var sqw = q.w * q.w;
		var sqx = q.x * q.x;
		var sqy = q.y * q.y;
		var sqz = q.z * q.z;
		var unit = sqx + sqy + sqz + sqw; // if normalised is one, otherwise is correction factor
		var test = q.x * q.y + q.z * q.w;

		if ( test > 0.499 * unit ) { // singularity at north pole

			this.y = 2 * Math.atan2( q.x, q.w );
			this.z = Math.PI / 2;
			this.x = 0;

			return;

		}

		if ( test < -0.499 * unit ) { // singularity at south pole

			this.y = -2 * Math.atan2( q.x, q.w );
			this.z = -Math.PI / 2;
			this.x = 0;

			return;

		}

		this.y = Math.atan2( 2 * q.y * q.w - 2 * q.x * q.z, sqx - sqy - sqz + sqw );
		this.z = Math.asin( 2 * test / unit );
		this.x = Math.atan2( 2 * q.x * q.w - 2 * q.y * q.z, -sqx + sqy - sqz + sqw );

	},

	*/

	getScaleFromMatrix: function ( m ) {

		var sx = this.set( m.elements[0], m.elements[1], m.elements[2] ).length();
		var sy = this.set( m.elements[4], m.elements[5], m.elements[6] ).length();
		var sz = this.set( m.elements[8], m.elements[9], m.elements[10] ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

	},

	equals: function ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	},

	isZero: function () {

		return ( this.lengthSq() < 0.0001 /* almostZero */ );

	},

	clone: function () {

		return new THREE.Vector3( this.x, this.y, this.z );

	}

};

/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 */

THREE.Vector4 = function ( x, y, z, w ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = ( w !== undefined ) ? w : 1;

};

THREE.Vector4.prototype = {

	constructor: THREE.Vector4,

	set: function ( x, y, z, w ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		this.w = ( v.w !== undefined ) ? v.w : 1;

		return this;

	},

	add: function ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;
		this.w = a.w + b.w;

		return this;

	},

	addSelf: function ( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		this.w += v.w;

		return this;

	},

	sub: function ( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;
		this.w = a.w - b.w;

		return this;

	},

	subSelf: function ( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		this.w -= v.w;

		return this;

	},

	multiplyScalar: function ( s ) {

		this.x *= s;
		this.y *= s;
		this.z *= s;
		this.w *= s;

		return this;

	},

	divideScalar: function ( s ) {

		if ( s ) {

			this.x /= s;
			this.y /= s;
			this.z /= s;
			this.w /= s;

		} else {

			this.x = 0;
			this.y = 0;
			this.z = 0;
			this.w = 1;

		}

		return this;

	},


	negate: function() {

		return this.multiplyScalar( -1 );

	},

	dot: function ( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;

	},

	lengthSq: function () {

		return this.dot( this );

	},

	length: function () {

		return Math.sqrt( this.lengthSq() );

	},

	normalize: function () {

		return this.divideScalar( this.length() );

	},

	setLength: function ( l ) {

		return this.normalize().multiplyScalar( l );

	},

	lerpSelf: function ( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;
		this.w += ( v.w - this.w ) * alpha;

		return this;

	},

	clone: function () {

		return new THREE.Vector4( this.x, this.y, this.z, this.w );

	}

};
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Frustum = function ( ) {

	this.planes = [

		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4()

	];

};

THREE.Frustum.prototype.setFromMatrix = function ( m ) {

	var i, plane, planes = this.planes;

	var me = m.elements;
	var me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
	var me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
	var me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
	var me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];

	planes[ 0 ].set( me3 - me0, me7 - me4, me11 - me8, me15 - me12 );
	planes[ 1 ].set( me3 + me0, me7 + me4, me11 + me8, me15 + me12 );
	planes[ 2 ].set( me3 + me1, me7 + me5, me11 + me9, me15 + me13 );
	planes[ 3 ].set( me3 - me1, me7 - me5, me11 - me9, me15 - me13 );
	planes[ 4 ].set( me3 - me2, me7 - me6, me11 - me10, me15 - me14 );
	planes[ 5 ].set( me3 + me2, me7 + me6, me11 + me10, me15 + me14 );

	for ( i = 0; i < 6; i ++ ) {

		plane = planes[ i ];
		plane.divideScalar( Math.sqrt( plane.x * plane.x + plane.y * plane.y + plane.z * plane.z ) );

	}

};

THREE.Frustum.prototype.contains = function ( object ) {

	var distance,
	planes = this.planes,
	matrix = object.matrixWorld,
	me = matrix.elements,
	radius = - object.geometry.boundingSphere.radius * matrix.getMaxScaleOnAxis();

	for ( var i = 0; i < 6; i ++ ) {

		distance = planes[ i ].x * me[12] + planes[ i ].y * me[13] + planes[ i ].z * me[14] + planes[ i ].w;
		if ( distance <= radius ) return false;

	}

	return true;

};

THREE.Frustum.__v1 = new THREE.Vector3();
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Ray = function ( origin, direction ) {

	this.origin = origin || new THREE.Vector3();
	this.direction = direction || new THREE.Vector3();

	var precision = 0.0001;

	this.setPrecision = function ( value ) {

		precision = value;

	};

	var a = new THREE.Vector3();
	var b = new THREE.Vector3();
	var c = new THREE.Vector3();
	var d = new THREE.Vector3();

	var originCopy = new THREE.Vector3();
	var directionCopy = new THREE.Vector3();

	var vector = new THREE.Vector3();
	var normal = new THREE.Vector3();
	var intersectPoint = new THREE.Vector3()

	this.intersectObject = function ( object ) {

		var intersect, intersects = [];

		if ( object instanceof THREE.Particle ) {

			var distance = distanceFromIntersection( this.origin, this.direction, object.matrixWorld.getPosition() );

			if ( distance > object.scale.x ) {

				return [];

			}

			intersect = {

				distance: distance,
				point: object.position,
				face: null,
				object: object

			};

			intersects.push( intersect );

		} else if ( object instanceof THREE.Mesh ) {

			// Checking boundingSphere

			var distance = distanceFromIntersection( this.origin, this.direction, object.matrixWorld.getPosition() );
			var scale = THREE.Frustum.__v1.set( object.matrixWorld.getColumnX().length(), object.matrixWorld.getColumnY().length(), object.matrixWorld.getColumnZ().length() );

			if ( distance > object.geometry.boundingSphere.radius * Math.max( scale.x, Math.max( scale.y, scale.z ) ) ) {

				return intersects;

			}

			// Checking faces

			var f, fl, face, dot, scalar,
			geometry = object.geometry,
			vertices = geometry.vertices,
			objMatrix;

			object.matrixRotationWorld.extractRotation( object.matrixWorld );

			for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

				face = geometry.faces[ f ];

				originCopy.copy( this.origin );
				directionCopy.copy( this.direction );

				objMatrix = object.matrixWorld;

				// determine if ray intersects the plane of the face
				// note: this works regardless of the direction of the face normal

				vector = objMatrix.multiplyVector3( vector.copy( face.centroid ) ).subSelf( originCopy );
				normal = object.matrixRotationWorld.multiplyVector3( normal.copy( face.normal ) );
				dot = directionCopy.dot( normal );

				// bail if ray and plane are parallel

				if ( Math.abs( dot ) < precision ) continue;

				// calc distance to plane

				scalar = normal.dot( vector ) / dot;

				// if negative distance, then plane is behind ray

				if ( scalar < 0 ) continue;

				if ( object.doubleSided || ( object.flipSided ? dot > 0 : dot < 0 ) ) {

					intersectPoint.add( originCopy, directionCopy.multiplyScalar( scalar ) );

					if ( face instanceof THREE.Face3 ) {

						a = objMatrix.multiplyVector3( a.copy( vertices[ face.a ] ) );
						b = objMatrix.multiplyVector3( b.copy( vertices[ face.b ] ) );
						c = objMatrix.multiplyVector3( c.copy( vertices[ face.c ] ) );

						if ( pointInFace3( intersectPoint, a, b, c ) ) {

							intersect = {

								distance: originCopy.distanceTo( intersectPoint ),
								point: intersectPoint.clone(),
								face: face,
								object: object

							};

							intersects.push( intersect );

						}

					} else if ( face instanceof THREE.Face4 ) {

						a = objMatrix.multiplyVector3( a.copy( vertices[ face.a ] ) );
						b = objMatrix.multiplyVector3( b.copy( vertices[ face.b ] ) );
						c = objMatrix.multiplyVector3( c.copy( vertices[ face.c ] ) );
						d = objMatrix.multiplyVector3( d.copy( vertices[ face.d ] ) );

						if ( pointInFace3( intersectPoint, a, b, d ) || pointInFace3( intersectPoint, b, c, d ) ) {

							intersect = {

								distance: originCopy.distanceTo( intersectPoint ),
								point: intersectPoint.clone(),
								face: face,
								object: object

							};

							intersects.push( intersect );

						}

					}

				}

			}

		}

		return intersects;

	}

	this.intersectObjects = function ( objects ) {

		var intersects = [];

		for ( var i = 0, l = objects.length; i < l; i ++ ) {

			Array.prototype.push.apply( intersects, this.intersectObject( objects[ i ] ) );

		}

		intersects.sort( function ( a, b ) { return a.distance - b.distance; } );

		return intersects;

	};

	var v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
	var dot, intersect, distance;

	function distanceFromIntersection( origin, direction, position ) {

		v0.sub( position, origin );
		dot = v0.dot( direction );

		intersect = v1.add( origin, v2.copy( direction ).multiplyScalar( dot ) );
		distance = position.distanceTo( intersect );

		return distance;

	}

	// http://www.blackpawn.com/texts/pointinpoly/default.html

	var dot00, dot01, dot02, dot11, dot12, invDenom, u, v;

	function pointInFace3( p, a, b, c ) {

		v0.sub( c, a );
		v1.sub( b, a );
		v2.sub( p, a );

		dot00 = v0.dot( v0 );
		dot01 = v0.dot( v1 );
		dot02 = v0.dot( v2 );
		dot11 = v1.dot( v1 );
		dot12 = v1.dot( v2 );

		invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 );
		u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
		v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

		return ( u >= 0 ) && ( v >= 0 ) && ( u + v < 1 );

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Rectangle = function () {

	var _left, _top, _right, _bottom,
	_width, _height, _isEmpty = true;

	function resize() {

		_width = _right - _left;
		_height = _bottom - _top;

	}

	this.getX = function () {

		return _left;

	};

	this.getY = function () {

		return _top;

	};

	this.getWidth = function () {

		return _width;

	};

	this.getHeight = function () {

		return _height;

	};

	this.getLeft = function() {

		return _left;

	};

	this.getTop = function() {

		return _top;

	};

	this.getRight = function() {

		return _right;

	};

	this.getBottom = function() {

		return _bottom;

	};

	this.set = function ( left, top, right, bottom ) {

		_isEmpty = false;

		_left = left; _top = top;
		_right = right; _bottom = bottom;

		resize();

	};

	this.addPoint = function ( x, y ) {

		if ( _isEmpty ) {

			_isEmpty = false;
			_left = x; _top = y;
			_right = x; _bottom = y;

			resize();

		} else {

			_left = _left < x ? _left : x; // Math.min( _left, x );
			_top = _top < y ? _top : y; // Math.min( _top, y );
			_right = _right > x ? _right : x; // Math.max( _right, x );
			_bottom = _bottom > y ? _bottom : y; // Math.max( _bottom, y );

			resize();
		}

	};

	this.add3Points = function ( x1, y1, x2, y2, x3, y3 ) {

		if (_isEmpty) {

			_isEmpty = false;
			_left = x1 < x2 ? ( x1 < x3 ? x1 : x3 ) : ( x2 < x3 ? x2 : x3 );
			_top = y1 < y2 ? ( y1 < y3 ? y1 : y3 ) : ( y2 < y3 ? y2 : y3 );
			_right = x1 > x2 ? ( x1 > x3 ? x1 : x3 ) : ( x2 > x3 ? x2 : x3 );
			_bottom = y1 > y2 ? ( y1 > y3 ? y1 : y3 ) : ( y2 > y3 ? y2 : y3 );

			resize();

		} else {

			_left = x1 < x2 ? ( x1 < x3 ? ( x1 < _left ? x1 : _left ) : ( x3 < _left ? x3 : _left ) ) : ( x2 < x3 ? ( x2 < _left ? x2 : _left ) : ( x3 < _left ? x3 : _left ) );
			_top = y1 < y2 ? ( y1 < y3 ? ( y1 < _top ? y1 : _top ) : ( y3 < _top ? y3 : _top ) ) : ( y2 < y3 ? ( y2 < _top ? y2 : _top ) : ( y3 < _top ? y3 : _top ) );
			_right = x1 > x2 ? ( x1 > x3 ? ( x1 > _right ? x1 : _right ) : ( x3 > _right ? x3 : _right ) ) : ( x2 > x3 ? ( x2 > _right ? x2 : _right ) : ( x3 > _right ? x3 : _right ) );
			_bottom = y1 > y2 ? ( y1 > y3 ? ( y1 > _bottom ? y1 : _bottom ) : ( y3 > _bottom ? y3 : _bottom ) ) : ( y2 > y3 ? ( y2 > _bottom ? y2 : _bottom ) : ( y3 > _bottom ? y3 : _bottom ) );

			resize();

		};

	};

	this.addRectangle = function ( r ) {

		if ( _isEmpty ) {

			_isEmpty = false;
			_left = r.getLeft(); _top = r.getTop();
			_right = r.getRight(); _bottom = r.getBottom();

			resize();

		} else {

			_left = _left < r.getLeft() ? _left : r.getLeft(); // Math.min(_left, r.getLeft() );
			_top = _top < r.getTop() ? _top : r.getTop(); // Math.min(_top, r.getTop() );
			_right = _right > r.getRight() ? _right : r.getRight(); // Math.max(_right, r.getRight() );
			_bottom = _bottom > r.getBottom() ? _bottom : r.getBottom(); // Math.max(_bottom, r.getBottom() );

			resize();

		}

	};

	this.inflate = function ( v ) {

		_left -= v; _top -= v;
		_right += v; _bottom += v;

		resize();

	};

	this.minSelf = function ( r ) {

		_left = _left > r.getLeft() ? _left : r.getLeft(); // Math.max( _left, r.getLeft() );
		_top = _top > r.getTop() ? _top : r.getTop(); // Math.max( _top, r.getTop() );
		_right = _right < r.getRight() ? _right : r.getRight(); // Math.min( _right, r.getRight() );
		_bottom = _bottom < r.getBottom() ? _bottom : r.getBottom(); // Math.min( _bottom, r.getBottom() );

		resize();

	};

	this.intersects = function ( r ) {

		// http://gamemath.com/2011/09/detecting-whether-two-boxes-overlap/

		if ( _right < r.getLeft() ) return false;
		if ( _left > r.getRight() ) return false;
		if ( _bottom < r.getTop() ) return false;
		if ( _top > r.getBottom() ) return false;

		return true;

	};

	this.empty = function () {

		_isEmpty = true;

		_left = 0; _top = 0;
		_right = 0; _bottom = 0;

		resize();

	};

	this.isEmpty = function () {

		return _isEmpty;

	};

};
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Math = {

	// Clamp value to range <a, b>

	clamp: function ( x, a, b ) {

		return ( x < a ) ? a : ( ( x > b ) ? b : x );

	},

	// Clamp value to range <a, inf)

	clampBottom: function ( x, a ) {

		return x < a ? a : x;

	},

	// Linear mapping from range <a1, a2> to range <b1, b2>

	mapLinear: function ( x, a1, a2, b1, b2 ) {

		return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );

	},

	// Random float from <0, 1> with 16 bits of randomness
	// (standard Math.random() creates repetitive patterns when applied over larger space)

	random16: function () {

		return ( 65280 * Math.random() + 255 * Math.random() ) / 65535;

	},

	// Random integer from <low, high> interval

	randInt: function ( low, high ) {

		return low + Math.floor( Math.random() * ( high - low + 1 ) );

	},

	// Random float from <low, high> interval

	randFloat: function ( low, high ) {

		return low + Math.random() * ( high - low );

	},

	// Random float from <-range/2, range/2> interval

	randFloatSpread: function ( range ) {

		return range * ( 0.5 - Math.random() );

	},

	sign: function ( x ) {

		return ( x < 0 ) ? -1 : ( ( x > 0 ) ? 1 : 0 );

	}

};
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Matrix3 = function () {

	this.elements = new Float32Array(9);

};

THREE.Matrix3.prototype = {

	constructor: THREE.Matrix3,

	getInverse: function ( matrix ) {

		// input: THREE.Matrix4
		// ( based on http://code.google.com/p/webgl-mjs/ )

        var me = matrix.elements;
        
		var a11 =   me[10] * me[5] - me[6] * me[9];
		var a21 = - me[10] * me[1] + me[2] * me[9];
		var a31 =   me[6] * me[1] - me[2] * me[5];
		var a12 = - me[10] * me[4] + me[6] * me[8];
		var a22 =   me[10] * me[0] - me[2] * me[8];
		var a32 = - me[6] * me[0] + me[2] * me[4];
		var a13 =   me[9] * me[4] - me[5] * me[8];
		var a23 = - me[9] * me[0] + me[1] * me[8];
		var a33 =   me[5] * me[0] - me[1] * me[4];

		var det = me[0] * a11 + me[1] * a12 + me[2] * a13;

		// no inverse

		if ( det === 0 ) {

			console.warn( "Matrix3.getInverse(): determinant == 0" );

		}

		var idet = 1.0 / det;

		var m = this.elements;

		m[ 0 ] = idet * a11; m[ 1 ] = idet * a21; m[ 2 ] = idet * a31;
		m[ 3 ] = idet * a12; m[ 4 ] = idet * a22; m[ 5 ] = idet * a32;
		m[ 6 ] = idet * a13; m[ 7 ] = idet * a23; m[ 8 ] = idet * a33;

		return this;

	},

	
	transpose: function () {

		var tmp, m = this.elements;

		tmp = m[1]; m[1] = m[3]; m[3] = tmp;
		tmp = m[2]; m[2] = m[6]; m[6] = tmp;
		tmp = m[5]; m[5] = m[7]; m[7] = tmp;

		return this;

	},
	

	transposeIntoArray: function ( r ) {

		var m = this.m;

		r[ 0 ] = m[ 0 ];
		r[ 1 ] = m[ 3 ];
		r[ 2 ] = m[ 6 ];
		r[ 3 ] = m[ 1 ];
		r[ 4 ] = m[ 4 ];
		r[ 5 ] = m[ 7 ];
		r[ 6 ] = m[ 2 ];
		r[ 7 ] = m[ 5 ];
		r[ 8 ] = m[ 8 ];

		return this;

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author timknip / http://www.floorplanner.com/
 */


THREE.Matrix4 = function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

    this.elements = new Float32Array(16);

	this.set(

		( n11 !== undefined ) ? n11 : 1, n12 || 0, n13 || 0, n14 || 0,
		n21 || 0, ( n22 !== undefined ) ? n22 : 1, n23 || 0, n24 || 0,
		n31 || 0, n32 || 0, ( n33 !== undefined ) ? n33 : 1, n34 || 0,
		n41 || 0, n42 || 0, n43 || 0, ( n44 !== undefined ) ? n44 : 1

	);

};

THREE.Matrix4.prototype = {

	constructor: THREE.Matrix4,

	set: function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {
        var te = this.elements;
        
		te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
		te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
		te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
		te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;

		return this;

	},

	identity: function () {

		this.set(

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		);

		return this;

	},

	copy: function ( m ) {
        
        var me = m.elements;
        
		this.set(

			me[0], me[4], me[8], me[12],
			me[1], me[5], me[9], me[13],
			me[2], me[6], me[10], me[14],
			me[3], me[7], me[11], me[15]

		);

		return this;

	},

	lookAt: function ( eye, target, up ) {
        var te = this.elements;
        
		var x = THREE.Matrix4.__v1;
		var y = THREE.Matrix4.__v2;
		var z = THREE.Matrix4.__v3;

		z.sub( eye, target ).normalize();

		if ( z.length() === 0 ) {

			z.z = 1;

		}

		x.cross( up, z ).normalize();

		if ( x.length() === 0 ) {

			z.x += 0.0001;
			x.cross( up, z ).normalize();

		}

		y.cross( z, x );


		te[0] = x.x; te[4] = y.x; te[8] = z.x;
		te[1] = x.y; te[5] = y.y; te[9] = z.y;
		te[2] = x.z; te[6] = y.z; te[10] = z.z;

		return this;

	},

	multiply: function ( a, b ) {
        
        var ae = a.elements,
            be = b.elements,
            te = this.elements;

		var a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
		var a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
		var a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
		var a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

		var b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
		var b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
		var b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
		var b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

		te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

		return this;

	},

	multiplySelf: function ( m ) {

		return this.multiply( this, m );

	},

	multiplyToArray: function ( a, b, r ) {
        
        var te = this.elements;
        
		this.multiply( a, b );

		r[ 0 ] = te[0]; r[ 1 ] = te[1]; r[ 2 ] = te[2]; r[ 3 ] = te[3];
		r[ 4 ] = te[4]; r[ 5 ] = te[5]; r[ 6 ] = te[6]; r[ 7 ] = te[7];
		r[ 8 ]  = te[8]; r[ 9 ]  = te[9]; r[ 10 ] = te[10]; r[ 11 ] = te[11];
		r[ 12 ] = te[12]; r[ 13 ] = te[13]; r[ 14 ] = te[14]; r[ 15 ] = te[15];

		return this;

	},

	multiplyScalar: function ( s ) {
        
        var te = this.elements;
        
		te[0] *= s; te[4] *= s; te[8] *= s; te[12] *= s;
		te[1] *= s; te[5] *= s; te[9] *= s; te[13] *= s;
		te[2] *= s; te[6] *= s; te[10] *= s; te[14] *= s;
		te[3] *= s; te[7] *= s; te[11] *= s; te[15] *= s;

		return this;

	},

	multiplyVector3: function ( v ) {
        var te = this.elements;
        
		var vx = v.x, vy = v.y, vz = v.z;
		var d = 1 / ( te[3] * vx + te[7] * vy + te[11] * vz + te[15] );

		v.x = ( te[0] * vx + te[4] * vy + te[8] * vz + te[12] ) * d;
		v.y = ( te[1] * vx + te[5] * vy + te[9] * vz + te[13] ) * d;
		v.z = ( te[2] * vx + te[6] * vy + te[10] * vz + te[14] ) * d;

		return v;

	},

	multiplyVector4: function ( v ) {
        
        var te = this.elements;
		var vx = v.x, vy = v.y, vz = v.z, vw = v.w;

		v.x = te[0] * vx + te[4] * vy + te[8] * vz + te[12] * vw;
		v.y = te[1] * vx + te[5] * vy + te[9] * vz + te[13] * vw;
		v.z = te[2] * vx + te[6] * vy + te[10] * vz + te[14] * vw;
		v.w = te[3] * vx + te[7] * vy + te[11] * vz + te[15] * vw;

		return v;

	},

	rotateAxis: function ( v ) {
        
        var te = this.elements;
		var vx = v.x, vy = v.y, vz = v.z;

		v.x = vx * te[0] + vy * te[4] + vz * te[8];
		v.y = vx * te[1] + vy * te[5] + vz * te[9];
		v.z = vx * te[2] + vy * te[6] + vz * te[10];

		v.normalize();

		return v;

	},

	crossVector: function ( a ) {
        
        var te = this.elements;
		var v = new THREE.Vector4();

		v.x = te[0] * a.x + te[4] * a.y + te[8] * a.z + te[12] * a.w;
		v.y = te[1] * a.x + te[5] * a.y + te[9] * a.z + te[13] * a.w;
		v.z = te[2] * a.x + te[6] * a.y + te[10] * a.z + te[14] * a.w;

		v.w = ( a.w ) ? te[3] * a.x + te[7] * a.y + te[11] * a.z + te[15] * a.w : 1;

		return v;

	},

	determinant: function () {

        var te = this.elements;
        
		var n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
		var n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
		var n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
		var n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];

		//TODO: make this more efficient
		//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

		return (
			n14 * n23 * n32 * n41-
			n13 * n24 * n32 * n41-
			n14 * n22 * n33 * n41+
			n12 * n24 * n33 * n41+

			n13 * n22 * n34 * n41-
			n12 * n23 * n34 * n41-
			n14 * n23 * n31 * n42+
			n13 * n24 * n31 * n42+

			n14 * n21 * n33 * n42-
			n11 * n24 * n33 * n42-
			n13 * n21 * n34 * n42+
			n11 * n23 * n34 * n42+

			n14 * n22 * n31 * n43-
			n12 * n24 * n31 * n43-
			n14 * n21 * n32 * n43+
			n11 * n24 * n32 * n43+

			n12 * n21 * n34 * n43-
			n11 * n22 * n34 * n43-
			n13 * n22 * n31 * n44+
			n12 * n23 * n31 * n44+

			n13 * n21 * n32 * n44-
			n11 * n23 * n32 * n44-
			n12 * n21 * n33 * n44+
			n11 * n22 * n33 * n44
		);

	},

	transpose: function () {
        var te = this.elements;
        
		var tmp;

		tmp = te[1]; te[1] = te[4]; te[4] = tmp;
		tmp = te[2]; te[2] = te[8]; te[8] = tmp;
		tmp = te[6]; te[6] = te[9]; te[9] = tmp;

		tmp = te[3]; te[3] = te[12]; te[12] = tmp;
		tmp = te[7]; te[7] = te[13]; te[13] = tmp;
		tmp = te[11]; te[11] = te[14]; te[14] = tmp;

		return this;

	},

	flattenToArray: function ( flat ) {

        var te = this.elements;
		flat[ 0 ] = te[0]; flat[ 1 ] = te[1]; flat[ 2 ] = te[2]; flat[ 3 ] = te[3];
		flat[ 4 ] = te[4]; flat[ 5 ] = te[5]; flat[ 6 ] = te[6]; flat[ 7 ] = te[7];
		flat[ 8 ]  = te[8]; flat[ 9 ]  = te[9]; flat[ 10 ] = te[10]; flat[ 11 ] = te[11];
		flat[ 12 ] = te[12]; flat[ 13 ] = te[13]; flat[ 14 ] = te[14]; flat[ 15 ] = te[15];

		return flat;

	},

	flattenToArrayOffset: function( flat, offset ) {

        var te = this.elements;
		flat[ offset ] = te[0];
		flat[ offset + 1 ] = te[1];
		flat[ offset + 2 ] = te[2];
		flat[ offset + 3 ] = te[3];

		flat[ offset + 4 ] = te[4];
		flat[ offset + 5 ] = te[5];
		flat[ offset + 6 ] = te[6];
		flat[ offset + 7 ] = te[7];

		flat[ offset + 8 ]  = te[8];
		flat[ offset + 9 ]  = te[9];
		flat[ offset + 10 ] = te[10];
		flat[ offset + 11 ] = te[11];

		flat[ offset + 12 ] = te[12];
		flat[ offset + 13 ] = te[13];
		flat[ offset + 14 ] = te[14];
		flat[ offset + 15 ] = te[15];

		return flat;

	},

	getPosition: function () {
        var te = this.elements;
        
		return THREE.Matrix4.__v1.set( te[12], te[13], te[14] );

	},

	setPosition: function ( v ) {
        var te = this.elements;
		te[12] = v.x;
		te[13] = v.y;
		te[14] = v.z;

		return this;

	},

	getColumnX: function () {
        var te = this.elements;
		return THREE.Matrix4.__v1.set( te[0], te[1], te[2] );

	},

	getColumnY: function () {
        var te = this.elements;
		return THREE.Matrix4.__v1.set( te[4], te[5], te[6] );

	},

	getColumnZ: function() {
        var te = this.elements;
		return THREE.Matrix4.__v1.set( te[8], te[9], te[10] );

	},

	getInverse: function ( m ) {

		// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
        var te = this.elements;
        var me = m.elements;
                
		var n11 = me[0], n12 = me[4], n13 = me[8], n14 = me[12];
		var n21 = me[1], n22 = me[5], n23 = me[9], n24 = me[13];
		var n31 = me[2], n32 = me[6], n33 = me[10], n34 = me[14];
		var n41 = me[3], n42 = me[7], n43 = me[11], n44 = me[15];

		te[0] = n23*n34*n42 - n24*n33*n42 + n24*n32*n43 - n22*n34*n43 - n23*n32*n44 + n22*n33*n44;
		te[4] = n14*n33*n42 - n13*n34*n42 - n14*n32*n43 + n12*n34*n43 + n13*n32*n44 - n12*n33*n44;
		te[8] = n13*n24*n42 - n14*n23*n42 + n14*n22*n43 - n12*n24*n43 - n13*n22*n44 + n12*n23*n44;
		te[12] = n14*n23*n32 - n13*n24*n32 - n14*n22*n33 + n12*n24*n33 + n13*n22*n34 - n12*n23*n34;
		te[1] = n24*n33*n41 - n23*n34*n41 - n24*n31*n43 + n21*n34*n43 + n23*n31*n44 - n21*n33*n44;
		te[5] = n13*n34*n41 - n14*n33*n41 + n14*n31*n43 - n11*n34*n43 - n13*n31*n44 + n11*n33*n44;
		te[9] = n14*n23*n41 - n13*n24*n41 - n14*n21*n43 + n11*n24*n43 + n13*n21*n44 - n11*n23*n44;
		te[13] = n13*n24*n31 - n14*n23*n31 + n14*n21*n33 - n11*n24*n33 - n13*n21*n34 + n11*n23*n34;
		te[2] = n22*n34*n41 - n24*n32*n41 + n24*n31*n42 - n21*n34*n42 - n22*n31*n44 + n21*n32*n44;
		te[6] = n14*n32*n41 - n12*n34*n41 - n14*n31*n42 + n11*n34*n42 + n12*n31*n44 - n11*n32*n44;
		te[10] = n12*n24*n41 - n14*n22*n41 + n14*n21*n42 - n11*n24*n42 - n12*n21*n44 + n11*n22*n44;
		te[14] = n14*n22*n31 - n12*n24*n31 - n14*n21*n32 + n11*n24*n32 + n12*n21*n34 - n11*n22*n34;
		te[3] = n23*n32*n41 - n22*n33*n41 - n23*n31*n42 + n21*n33*n42 + n22*n31*n43 - n21*n32*n43;
		te[7] = n12*n33*n41 - n13*n32*n41 + n13*n31*n42 - n11*n33*n42 - n12*n31*n43 + n11*n32*n43;
		te[11] = n13*n22*n41 - n12*n23*n41 - n13*n21*n42 + n11*n23*n42 + n12*n21*n43 - n11*n22*n43;
		te[15] = n12*n23*n31 - n13*n22*n31 + n13*n21*n32 - n11*n23*n32 - n12*n21*n33 + n11*n22*n33;
		this.multiplyScalar( 1 / m.determinant() );

		return this;

	},

	setRotationFromEuler: function( v, order ) {
        var te = this.elements;
        
		var x = v.x, y = v.y, z = v.z;
		var a = Math.cos( x ), b = Math.sin( x );
		var c = Math.cos( y ), d = Math.sin( y );
		var e = Math.cos( z ), f = Math.sin( z );

		switch ( order ) {

			case 'YXZ':

				var ce = c * e, cf = c * f, de = d * e, df = d * f;

				te[0] = ce + df * b;
				te[4] = de * b - cf;
				te[8] = a * d;

				te[1] = a * f;
				te[5] = a * e;
				te[9] = - b;

				te[2] = cf * b - de;
				te[6] = df + ce * b;
				te[10] = a * c;
				break;

			case 'ZXY':

				var ce = c * e, cf = c * f, de = d * e, df = d * f;

				te[0] = ce - df * b;
				te[4] = - a * f;
				te[8] = de + cf * b;

				te[1] = cf + de * b;
				te[5] = a * e;
				te[9] = df - ce * b;

				te[2] = - a * d;
				te[6] = b;
				te[10] = a * c;
				break;

			case 'ZYX':

				var ae = a * e, af = a * f, be = b * e, bf = b * f;

				te[0] = c * e;
				te[4] = be * d - af;
				te[8] = ae * d + bf;

				te[1] = c * f;
				te[5] = bf * d + ae;
				te[9] = af * d - be;

				te[2] = - d;
				te[6] = b * c;
				te[10] = a * c;
				break;

			case 'YZX':

				var ac = a * c, ad = a * d, bc = b * c, bd = b * d;

				te[0] = c * e;
				te[4] = bd - ac * f;
				te[8] = bc * f + ad;

				te[1] = f;
				te[5] = a * e;
				te[9] = - b * e;

				te[2] = - d * e;
				te[6] = ad * f + bc;
				te[10] = ac - bd * f;
				break;

			case 'XZY':

				var ac = a * c, ad = a * d, bc = b * c, bd = b * d;

				te[0] = c * e;
				te[4] = - f;
				te[8] = d * e;

				te[1] = ac * f + bd;
				te[5] = a * e;
				te[9] = ad * f - bc;

				te[2] = bc * f - ad;
				te[6] = b * e;
				te[10] = bd * f + ac;
				break;

			default: // 'XYZ'

				var ae = a * e, af = a * f, be = b * e, bf = b * f;

				te[0] = c * e;
				te[4] = - c * f;
				te[8] = d;

				te[1] = af + be * d;
				te[5] = ae - bf * d;
				te[9] = - b * c;

				te[2] = bf - ae * d;
				te[6] = be + af * d;
				te[10] = a * c;
				break;

		}

		return this;

	},


	setRotationFromQuaternion: function( q ) {
        var te = this.elements;
        
		var x = q.x, y = q.y, z = q.z, w = q.w;
		var x2 = x + x, y2 = y + y, z2 = z + z;
		var xx = x * x2, xy = x * y2, xz = x * z2;
		var yy = y * y2, yz = y * z2, zz = z * z2;
		var wx = w * x2, wy = w * y2, wz = w * z2;

		te[0] = 1 - ( yy + zz );
		te[4] = xy - wz;
		te[8] = xz + wy;

		te[1] = xy + wz;
		te[5] = 1 - ( xx + zz );
		te[9] = yz - wx;

		te[2] = xz - wy;
		te[6] = yz + wx;
		te[10] = 1 - ( xx + yy );

		return this;

	},

	compose: function ( translation, rotation, scale ) {
        var te = this.elements;
		var mRotation = THREE.Matrix4.__m1;
		var mScale = THREE.Matrix4.__m2;

		mRotation.identity();
		mRotation.setRotationFromQuaternion( rotation );

		mScale.makeScale( scale.x, scale.y, scale.z );

		this.multiply( mRotation, mScale );

		te[12] = translation.x;
		te[13] = translation.y;
		te[14] = translation.z;

		return this;

	},

	decompose: function ( translation, rotation, scale ) {

		// grab the axis vectors
        var te = this.elements;
		var x = THREE.Matrix4.__v1;
		var y = THREE.Matrix4.__v2;
		var z = THREE.Matrix4.__v3;

		x.set( te[0], te[1], te[2] );
		y.set( te[4], te[5], te[6] );
		z.set( te[8], te[9], te[10] );

		translation = ( translation instanceof THREE.Vector3 ) ? translation : new THREE.Vector3();
		rotation = ( rotation instanceof THREE.Quaternion ) ? rotation : new THREE.Quaternion();
		scale = ( scale instanceof THREE.Vector3 ) ? scale : new THREE.Vector3();

		scale.x = x.length();
		scale.y = y.length();
		scale.z = z.length();

		translation.x = te[12];
		translation.y = te[13];
		translation.z = te[14];

		// scale the rotation part

		var matrix = THREE.Matrix4.__m1;

		matrix.copy( this );

		matrix.elements[0] /= scale.x;
		matrix.elements[1] /= scale.x;
		matrix.elements[2] /= scale.x;

		matrix.elements[4] /= scale.y;
		matrix.elements[5] /= scale.y;
		matrix.elements[6] /= scale.y;

		matrix.elements[8] /= scale.z;
		matrix.elements[9] /= scale.z;
		matrix.elements[10] /= scale.z;

		rotation.setFromRotationMatrix( matrix );

		return [ translation, rotation, scale ];

	},

	extractPosition: function ( m ) {
        var te = this.elements;
        var me = m.elements;
		te[12] = me[12];
		te[13] = me[13];
		te[14] = me[14];

		return this;

	},

	extractRotation: function ( m ) {
        var te = this.elements;
        var me = m.elements;
        
		var vector = THREE.Matrix4.__v1;

		var scaleX = 1 / vector.set( me[0], me[1], me[2] ).length();
		var scaleY = 1 / vector.set( me[4], me[5], me[6] ).length();
		var scaleZ = 1 / vector.set( me[8], me[9], me[10] ).length();

		te[0] = me[0] * scaleX;
		te[1] = me[1] * scaleX;
		te[2] = me[2] * scaleX;

		te[4] = me[4] * scaleY;
		te[5] = me[5] * scaleY;
		te[6] = me[6] * scaleY;

		te[8] = me[8] * scaleZ;
		te[9] = me[9] * scaleZ;
		te[10] = me[10] * scaleZ;

		return this;

	},

	//

	translate: function ( v ) {
        var te = this.elements;
		var x = v.x, y = v.y, z = v.z;

		te[12] = te[0] * x + te[4] * y + te[8] * z + te[12];
		te[13] = te[1] * x + te[5] * y + te[9] * z + te[13];
		te[14] = te[2] * x + te[6] * y + te[10] * z + te[14];
		te[15] = te[3] * x + te[7] * y + te[11] * z + te[15];

		return this;

	},

	rotateX: function ( angle ) {
        var te = this.elements;
		var m12 = te[4];
		var m22 = te[5];
		var m32 = te[6];
		var m42 = te[7];
		var m13 = te[8];
		var m23 = te[9];
		var m33 = te[10];
		var m43 = te[11];
		var c = Math.cos( angle );
		var s = Math.sin( angle );

		te[4] = c * m12 + s * m13;
		te[5] = c * m22 + s * m23;
		te[6] = c * m32 + s * m33;
		te[7] = c * m42 + s * m43;

		te[8] = c * m13 - s * m12;
		te[9] = c * m23 - s * m22;
		te[10] = c * m33 - s * m32;
		te[11] = c * m43 - s * m42;

		return this;

  	},

	rotateY: function ( angle ) {
        var te = this.elements;
		var m11 = te[0];
		var m21 = te[1];
		var m31 = te[2];
		var m41 = te[3];
		var m13 = te[8];
		var m23 = te[9];
		var m33 = te[10];
		var m43 = te[11];
		var c = Math.cos( angle );
		var s = Math.sin( angle );

		te[0] = c * m11 - s * m13;
		te[1] = c * m21 - s * m23;
		te[2] = c * m31 - s * m33;
		te[3] = c * m41 - s * m43;

		te[8] = c * m13 + s * m11;
		te[9] = c * m23 + s * m21;
		te[10] = c * m33 + s * m31;
		te[11] = c * m43 + s * m41;

		return this;

	},

	rotateZ: function ( angle ) {
        var te = this.elements;
		var m11 = te[0];
		var m21 = te[1];
		var m31 = te[2];
		var m41 = te[3];
		var m12 = te[4];
		var m22 = te[5];
		var m32 = te[6];
		var m42 = te[7];
		var c = Math.cos( angle );
		var s = Math.sin( angle );

		te[0] = c * m11 + s * m12;
		te[1] = c * m21 + s * m22;
		te[2] = c * m31 + s * m32;
		te[3] = c * m41 + s * m42;

		te[4] = c * m12 - s * m11;
		te[5] = c * m22 - s * m21;
		te[6] = c * m32 - s * m31;
		te[7] = c * m42 - s * m41;

		return this;

	},

	rotateByAxis: function ( axis, angle ) {
        var te = this.elements;
		// optimize by checking axis

		if ( axis.x === 1 && axis.y === 0 && axis.z === 0 ) {

			return this.rotateX( angle );

		} else if ( axis.x === 0 && axis.y === 1 && axis.z === 0 ) {

			return this.rotateY( angle );

		} else if ( axis.x === 0 && axis.y === 0 && axis.z === 1 ) {

			return this.rotateZ( angle );

		}

		var x = axis.x, y = axis.y, z = axis.z;
		var n = Math.sqrt(x * x + y * y + z * z);

		x /= n;
		y /= n;
		z /= n;

		var xx = x * x, yy = y * y, zz = z * z;
		var c = Math.cos( angle );
		var s = Math.sin( angle );
		var oneMinusCosine = 1 - c;
		var xy = x * y * oneMinusCosine;
		var xz = x * z * oneMinusCosine;
		var yz = y * z * oneMinusCosine;
		var xs = x * s;
		var ys = y * s;
		var zs = z * s;

		var r11 = xx + (1 - xx) * c;
		var r21 = xy + zs;
		var r31 = xz - ys;
		var r12 = xy - zs;
		var r22 = yy + (1 - yy) * c;
		var r32 = yz + xs;
		var r13 = xz + ys;
		var r23 = yz - xs;
		var r33 = zz + (1 - zz) * c;

		var m11 = te[0], m21 = te[1], m31 = te[2], m41 = te[3];
		var m12 = te[4], m22 = te[5], m32 = te[6], m42 = te[7];
		var m13 = te[8], m23 = te[9], m33 = te[10], m43 = te[11];
		var m14 = te[12], m24 = te[13], m34 = te[14], m44 = te[15];

		te[0] = r11 * m11 + r21 * m12 + r31 * m13;
		te[1] = r11 * m21 + r21 * m22 + r31 * m23;
		te[2] = r11 * m31 + r21 * m32 + r31 * m33;
		te[3] = r11 * m41 + r21 * m42 + r31 * m43;

		te[4] = r12 * m11 + r22 * m12 + r32 * m13;
		te[5] = r12 * m21 + r22 * m22 + r32 * m23;
		te[6] = r12 * m31 + r22 * m32 + r32 * m33;
		te[7] = r12 * m41 + r22 * m42 + r32 * m43;

		te[8] = r13 * m11 + r23 * m12 + r33 * m13;
		te[9] = r13 * m21 + r23 * m22 + r33 * m23;
		te[10] = r13 * m31 + r23 * m32 + r33 * m33;
		te[11] = r13 * m41 + r23 * m42 + r33 * m43;

		return this;

	},

	scale: function ( v ) {

		var te = this.elements;
		var x = v.x, y = v.y, z = v.z;

		te[0] *= x; te[4] *= y; te[8] *= z;
		te[1] *= x; te[5] *= y; te[9] *= z;
		te[2] *= x; te[6] *= y; te[10] *= z;
		te[3] *= x; te[7] *= y; te[11] *= z;

		return this;

	},

	getMaxScaleOnAxis: function () {

		var te = this.elements;

		var scaleXSq =  te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
		var scaleYSq =  te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
		var scaleZSq =  te[8] * te[8] + te[9] * te[9] + te[10] * te[10];

		return Math.sqrt( Math.max( scaleXSq, Math.max( scaleYSq, scaleZSq ) ) );

	},

	//

	makeTranslation: function ( x, y, z ) {

		this.set(

			1, 0, 0, x,
			0, 1, 0, y,
			0, 0, 1, z,
			0, 0, 0, 1

		);

		return this;

	},

	makeRotationX: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			1, 0,  0, 0,
			0, c, -s, 0,
			0, s,  c, 0,
			0, 0,  0, 1

		);

		return this;

	},

	makeRotationY: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			 c, 0, s, 0,
			 0, 1, 0, 0,
			-s, 0, c, 0,
			 0, 0, 0, 1

		);

		return this;

	},

	makeRotationZ: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			c, -s, 0, 0,
			s,  c, 0, 0,
			0,  0, 1, 0,
			0,  0, 0, 1

		);

		return this;

	},

	makeRotationAxis: function ( axis, angle ) {

		// Based on http://www.gamedev.net/reference/articles/article1199.asp

		var c = Math.cos( angle );
		var s = Math.sin( angle );
		var t = 1 - c;
		var x = axis.x, y = axis.y, z = axis.z;
		var tx = t * x, ty = t * y;

		this.set(

		 	tx * x + c, tx * y - s * z, tx * z + s * y, 0,
			tx * y + s * z, ty * y + c, ty * z - s * x, 0,
			tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
			0, 0, 0, 1

		);

		 return this;

	},

	makeScale: function ( x, y, z ) {

		this.set(

			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1

		);

		return this;

	},

	makeFrustum: function ( left, right, bottom, top, near, far ) {
        var te = this.elements;
		var x = 2 * near / ( right - left );
		var y = 2 * near / ( top - bottom );

		var a = ( right + left ) / ( right - left );
		var b = ( top + bottom ) / ( top - bottom );
		var c = - ( far + near ) / ( far - near );
		var d = - 2 * far * near / ( far - near );

		te[0] = x;  te[4] = 0;  te[8] = a;   te[12] = 0;
		te[1] = 0;  te[5] = y;  te[9] = b;   te[13] = 0;
		te[2] = 0;  te[6] = 0;  te[10] = c;   te[14] = d;
		te[3] = 0;  te[7] = 0;  te[11] = - 1; te[15] = 0;

		return this;

	},

	makePerspective: function ( fov, aspect, near, far ) {

		var ymax = near * Math.tan( fov * Math.PI / 360 );
		var ymin = - ymax;
		var xmin = ymin * aspect;
		var xmax = ymax * aspect;

		return this.makeFrustum( xmin, xmax, ymin, ymax, near, far );

	},

	makeOrthographic: function ( left, right, top, bottom, near, far ) {
        var te = this.elements;
		var w = right - left;
		var h = top - bottom;
		var p = far - near;

		var x = ( right + left ) / w;
		var y = ( top + bottom ) / h;
		var z = ( far + near ) / p;

		te[0] = 2 / w; te[4] = 0;     te[8] = 0;      te[12] = -x;
		te[1] = 0;     te[5] = 2 / h; te[9] = 0;      te[13] = -y;
		te[2] = 0;     te[6] = 0;     te[10] = -2 / p; te[14] = -z;
		te[3] = 0;     te[7] = 0;     te[11] = 0;      te[15] = 1;

		return this;

	},


	clone: function () {
        var te = this.elements;
		return new THREE.Matrix4(

			te[0], te[4], te[8], te[12],
			te[1], te[5], te[9], te[13],
			te[2], te[6], te[10], te[14],
			te[3], te[7], te[11], te[15]

		);

	}

};

THREE.Matrix4.__v1 = new THREE.Vector3();
THREE.Matrix4.__v2 = new THREE.Vector3();
THREE.Matrix4.__v3 = new THREE.Vector3();

THREE.Matrix4.__m1 = new THREE.Matrix4();
THREE.Matrix4.__m2 = new THREE.Matrix4();
/**
 * @author mr.doob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Object3D = function () {

	this.id = THREE.Object3DCount ++;

	this.name = '';

	this.parent = undefined;
	this.children = [];

	this.up = new THREE.Vector3( 0, 1, 0 );

	this.position = new THREE.Vector3();
	this.rotation = new THREE.Vector3();
	this.eulerOrder = 'XYZ';
	this.scale = new THREE.Vector3( 1, 1, 1 );

	this.doubleSided = false;
	this.flipSided = false;

	this.renderDepth = null;

	this.rotationAutoUpdate = true;

	this.matrix = new THREE.Matrix4();
	this.matrixWorld = new THREE.Matrix4();
	this.matrixRotationWorld = new THREE.Matrix4();

	this.matrixAutoUpdate = true;
	this.matrixWorldNeedsUpdate = true;

	this.quaternion = new THREE.Quaternion();
	this.useQuaternion = false;

	this.boundRadius = 0.0;
	this.boundRadiusScale = 1.0;

	this.visible = true;

	this.castShadow = false;
	this.receiveShadow = false;

	this.frustumCulled = true;

	this._vector = new THREE.Vector3();

};


THREE.Object3D.prototype = {

	constructor: THREE.Object3D,

	applyMatrix: function ( matrix ) {

		this.matrix.multiply( matrix, this.matrix );

		this.scale.getScaleFromMatrix( this.matrix );
		this.rotation.getRotationFromMatrix( this.matrix, this.scale );
		this.position.getPositionFromMatrix( this.matrix );

	},

	translate: function ( distance, axis ) {

		this.matrix.rotateAxis( axis );
		this.position.addSelf( axis.multiplyScalar( distance ) );

	},

	translateX: function ( distance ) {

		this.translate( distance, this._vector.set( 1, 0, 0 ) );

	},

	translateY: function ( distance ) {

		this.translate( distance, this._vector.set( 0, 1, 0 ) );

	},

	translateZ: function ( distance ) {

		this.translate( distance, this._vector.set( 0, 0, 1 ) );

	},

	lookAt: function ( vector ) {

		// TODO: Add hierarchy support.

		this.matrix.lookAt( vector, this.position, this.up );

		if ( this.rotationAutoUpdate ) {

			this.rotation.getRotationFromMatrix( this.matrix );

		}

	},

	add: function ( object ) {

		if ( object === this ) {

			console.warn( 'THREE.Object3D.add: An object can\'t be added as a child of itself.' );
			return;

		}

		if ( object instanceof THREE.Object3D ) { // && this.children.indexOf( object ) === - 1

			if ( object.parent !== undefined ) {

				object.parent.remove( object );

			}

			object.parent = this;
			this.children.push( object );

			// add to scene

			var scene = this;

			while ( scene.parent !== undefined ) {

				scene = scene.parent;

			}

			if ( scene !== undefined && scene instanceof THREE.Scene )  {

				scene.__addObject( object );

			}

		}

	},

	remove: function ( object ) {

		var index = this.children.indexOf( object );

		if ( index !== - 1 ) {

			object.parent = undefined;
			this.children.splice( index, 1 );

			// remove from scene

			var scene = this;

			while ( scene.parent !== undefined ) {

				scene = scene.parent;

			}

			if ( scene !== undefined && scene instanceof THREE.Scene ) {

				scene.__removeObject( object );

			}

		}

	},

	getChildByName: function ( name, recursive ) {

		var c, cl, child;

		for ( c = 0, cl = this.children.length; c < cl; c ++ ) {

			child = this.children[ c ];

			if ( child.name === name ) {

				return child;

			}

			if ( recursive ) {

				child = child.getChildByName( name, recursive );

				if ( child !== undefined ) {

					return child;

				}

			}

		}

		return undefined;

	},

	updateMatrix: function () {

		this.matrix.setPosition( this.position );

		if ( this.useQuaternion )  {

			this.matrix.setRotationFromQuaternion( this.quaternion );

		} else {

			this.matrix.setRotationFromEuler( this.rotation, this.eulerOrder );

		}

		if ( this.scale.x !== 1 || this.scale.y !== 1 || this.scale.z !== 1 ) {

			this.matrix.scale( this.scale );
			this.boundRadiusScale = Math.max( this.scale.x, Math.max( this.scale.y, this.scale.z ) );

		}

		this.matrixWorldNeedsUpdate = true;

	},

	updateMatrixWorld: function ( force ) {

		this.matrixAutoUpdate && this.updateMatrix();

		// update matrixWorld

		if ( this.matrixWorldNeedsUpdate || force ) {

			if ( this.parent ) {

				this.matrixWorld.multiply( this.parent.matrixWorld, this.matrix );

			} else {

				this.matrixWorld.copy( this.matrix );

			}

			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// update children

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			this.children[ i ].updateMatrixWorld( force );

		}

	}

};

THREE.Object3DCount = 0;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author julianwa / https://github.com/julianwa
 */

THREE.Projector = function() {

	var _object, _objectCount, _objectPool = [],
	_vertex, _vertexCount, _vertexPool = [],
	_face, _face3Count, _face3Pool = [], _face4Count, _face4Pool = [],
	_line, _lineCount, _linePool = [],
	_particle, _particleCount, _particlePool = [],

	_renderData = { objects: [], sprites: [], lights: [], elements: [] },

	_vector3 = new THREE.Vector3(),
	_vector4 = new THREE.Vector4(),

	_projScreenMatrix = new THREE.Matrix4(),
	_projScreenobjectMatrixWorld = new THREE.Matrix4(),

	_frustum = new THREE.Frustum(),

	_clippedVertex1PositionScreen = new THREE.Vector4(),
	_clippedVertex2PositionScreen = new THREE.Vector4(),

	_face3VertexNormals;

	this.projectVector = function ( vector, camera ) {

		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

		_projScreenMatrix.multiply( camera.projectionMatrix, camera.matrixWorldInverse );
		_projScreenMatrix.multiplyVector3( vector );

		return vector;

	};

	this.unprojectVector = function ( vector, camera ) {

		camera.projectionMatrixInverse.getInverse( camera.projectionMatrix );

		_projScreenMatrix.multiply( camera.matrixWorld, camera.projectionMatrixInverse );
		_projScreenMatrix.multiplyVector3( vector );

		return vector;

	};

	this.pickingRay = function ( vector, camera ) {

		var end, ray, t;

		// set two vectors with opposing z values
		vector.z = -1.0;
		end = new THREE.Vector3( vector.x, vector.y, 1.0 );

		this.unprojectVector( vector, camera );
		this.unprojectVector( end, camera );

		// find direction from vector to end
		end.subSelf( vector ).normalize();

		return new THREE.Ray( vector, end );

	};

	this.projectGraph = function ( root, sort ) {

		_objectCount = 0;

		_renderData.objects.length = 0;
		_renderData.sprites.length = 0;
		_renderData.lights.length = 0;

		var projectObject = function ( object ) {

			if ( object.visible === false ) return;

			if ( ( object instanceof THREE.Mesh || object instanceof THREE.Line ) &&
			( object.frustumCulled === false || _frustum.contains( object ) ) ) {

				_vector3.copy( object.matrixWorld.getPosition() );
				_projScreenMatrix.multiplyVector3( _vector3 );

				_object = getNextObjectInPool();
				_object.object = object;
				_object.z = _vector3.z;

				_renderData.objects.push( _object );

			} else if ( object instanceof THREE.Sprite || object instanceof THREE.Particle ) {

				_vector3.copy( object.matrixWorld.getPosition() );
				_projScreenMatrix.multiplyVector3( _vector3 );

				_object = getNextObjectInPool();
				_object.object = object;
				_object.z = _vector3.z;

				_renderData.sprites.push( _object );

			} else if ( object instanceof THREE.Light ) {

				_renderData.lights.push( object );

			}

			for ( var c = 0, cl = object.children.length; c < cl; c ++ ) {

				projectObject( object.children[ c ] );

			}

		};

		projectObject( root );

		sort && _renderData.objects.sort( painterSort );

		return _renderData;

	};

	this.projectScene = function ( scene, camera, sort ) {

		var near = camera.near, far = camera.far, visible = false,
		o, ol, v, vl, f, fl, n, nl, c, cl, u, ul, object,
		objectMatrixWorld, objectMatrixWorldRotation,
		geometry, geometryMaterials, vertices, vertex, vertexPositionScreen,
		faces, face, faceVertexNormals, normal, faceVertexUvs, uvs,
		v1, v2, v3, v4;

		_face3Count = 0;
		_face4Count = 0;
		_lineCount = 0;
		_particleCount = 0;

		_renderData.elements.length = 0;

		if ( camera.parent === undefined ) {

			console.warn( 'DEPRECATED: Camera hasn\'t been added to a Scene. Adding it...' );
			scene.add( camera );

		}

		scene.updateMatrixWorld();

		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

		_projScreenMatrix.multiply( camera.projectionMatrix, camera.matrixWorldInverse );

		_frustum.setFromMatrix( _projScreenMatrix );

		_renderData = this.projectGraph( scene, false );

		for ( o = 0, ol = _renderData.objects.length; o < ol; o++ ) {

			object = _renderData.objects[ o ].object;

			objectMatrixWorld = object.matrixWorld;

			_vertexCount = 0;

			if ( object instanceof THREE.Mesh ) {

				geometry = object.geometry;
				geometryMaterials = object.geometry.materials;
				vertices = geometry.vertices;
				faces = geometry.faces;
				faceVertexUvs = geometry.faceVertexUvs;

				objectMatrixWorldRotation = object.matrixRotationWorld.extractRotation( objectMatrixWorld );

				for ( v = 0, vl = vertices.length; v < vl; v ++ ) {

					_vertex = getNextVertexInPool();
					_vertex.positionWorld.copy( vertices[ v ] );

					objectMatrixWorld.multiplyVector3( _vertex.positionWorld );

					_vertex.positionScreen.copy( _vertex.positionWorld );
					_projScreenMatrix.multiplyVector4( _vertex.positionScreen );

					_vertex.positionScreen.x /= _vertex.positionScreen.w;
					_vertex.positionScreen.y /= _vertex.positionScreen.w;

					_vertex.visible = _vertex.positionScreen.z > near && _vertex.positionScreen.z < far;

				}

				for ( f = 0, fl = faces.length; f < fl; f ++ ) {

					face = faces[ f ];

					if ( face instanceof THREE.Face3 ) {

						v1 = _vertexPool[ face.a ];
						v2 = _vertexPool[ face.b ];
						v3 = _vertexPool[ face.c ];

						if ( v1.visible && v2.visible && v3.visible ) {

							visible = ( ( v3.positionScreen.x - v1.positionScreen.x ) * ( v2.positionScreen.y - v1.positionScreen.y ) -
								( v3.positionScreen.y - v1.positionScreen.y ) * ( v2.positionScreen.x - v1.positionScreen.x ) ) < 0;

							if ( object.doubleSided || visible != object.flipSided ) {

								_face = getNextFace3InPool();

								_face.v1.copy( v1 );
								_face.v2.copy( v2 );
								_face.v3.copy( v3 );

							} else {

								continue;

							}

						} else {

							continue;

						}

					} else if ( face instanceof THREE.Face4 ) {

						v1 = _vertexPool[ face.a ];
						v2 = _vertexPool[ face.b ];
						v3 = _vertexPool[ face.c ];
						v4 = _vertexPool[ face.d ];

						if ( v1.visible && v2.visible && v3.visible && v4.visible ) {

							visible = ( v4.positionScreen.x - v1.positionScreen.x ) * ( v2.positionScreen.y - v1.positionScreen.y ) -
								( v4.positionScreen.y - v1.positionScreen.y ) * ( v2.positionScreen.x - v1.positionScreen.x ) < 0 ||
								( v2.positionScreen.x - v3.positionScreen.x ) * ( v4.positionScreen.y - v3.positionScreen.y ) -
								( v2.positionScreen.y - v3.positionScreen.y ) * ( v4.positionScreen.x - v3.positionScreen.x ) < 0;


							if ( object.doubleSided || visible != object.flipSided ) {

								_face = getNextFace4InPool();

								_face.v1.copy( v1 );
								_face.v2.copy( v2 );
								_face.v3.copy( v3 );
								_face.v4.copy( v4 );

							} else {

								continue;

							}

						} else {

							continue;

						}

					}

					_face.normalWorld.copy( face.normal );
					if ( !visible && ( object.flipSided || object.doubleSided ) ) _face.normalWorld.negate();
					objectMatrixWorldRotation.multiplyVector3( _face.normalWorld );

					_face.centroidWorld.copy( face.centroid );
					objectMatrixWorld.multiplyVector3( _face.centroidWorld );

					_face.centroidScreen.copy( _face.centroidWorld );
					_projScreenMatrix.multiplyVector3( _face.centroidScreen );

					faceVertexNormals = face.vertexNormals;

					for ( n = 0, nl = faceVertexNormals.length; n < nl; n ++ ) {

						normal = _face.vertexNormalsWorld[ n ];
						normal.copy( faceVertexNormals[ n ] );
						if ( !visible && ( object.flipSided || object.doubleSided ) ) normal.negate();
						objectMatrixWorldRotation.multiplyVector3( normal );

					}

					for ( c = 0, cl = faceVertexUvs.length; c < cl; c ++ ) {

						uvs = faceVertexUvs[ c ][ f ];

						if ( !uvs ) continue;

						for ( u = 0, ul = uvs.length; u < ul; u ++ ) {

							_face.uvs[ c ][ u ] = uvs[ u ];

						}

					}

					_face.material = object.material;
					_face.faceMaterial = face.materialIndex !== null ? geometryMaterials[ face.materialIndex ] : null;

					_face.z = _face.centroidScreen.z;

					_renderData.elements.push( _face );

				}

			} else if ( object instanceof THREE.Line ) {

				_projScreenobjectMatrixWorld.multiply( _projScreenMatrix, objectMatrixWorld );

				vertices = object.geometry.vertices;
				
				v1 = getNextVertexInPool();
				v1.positionScreen.copy( vertices[ 0 ] );
				_projScreenobjectMatrixWorld.multiplyVector4( v1.positionScreen );

				// Handle LineStrip and LinePieces
				var step = object.type === THREE.LinePieces ? 2 : 1;

				for ( v = 1, vl = vertices.length; v < vl; v ++ ) {

					v1 = getNextVertexInPool();
					v1.positionScreen.copy( vertices[ v ] );
					_projScreenobjectMatrixWorld.multiplyVector4( v1.positionScreen );

					if ( ( v + 1 ) % step > 0 ) continue;

					v2 = _vertexPool[ _vertexCount - 2 ];

					_clippedVertex1PositionScreen.copy( v1.positionScreen );
					_clippedVertex2PositionScreen.copy( v2.positionScreen );

					if ( clipLine( _clippedVertex1PositionScreen, _clippedVertex2PositionScreen ) ) {

						// Perform the perspective divide
						_clippedVertex1PositionScreen.multiplyScalar( 1 / _clippedVertex1PositionScreen.w );
						_clippedVertex2PositionScreen.multiplyScalar( 1 / _clippedVertex2PositionScreen.w );

						_line = getNextLineInPool();
						_line.v1.positionScreen.copy( _clippedVertex1PositionScreen );
						_line.v2.positionScreen.copy( _clippedVertex2PositionScreen );

						_line.z = Math.max( _clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z );

						_line.material = object.material;

						_renderData.elements.push( _line );

					}

				}

			}

		}

		for ( o = 0, ol = _renderData.sprites.length; o < ol; o++ ) {

			object = _renderData.sprites[ o ].object;

			objectMatrixWorld = object.matrixWorld;

			if ( object instanceof THREE.Particle ) {

				_vector4.set( objectMatrixWorld.elements[12], objectMatrixWorld.elements[13], objectMatrixWorld.elements[14], 1 );
				_projScreenMatrix.multiplyVector4( _vector4 );

				_vector4.z /= _vector4.w;

				if ( _vector4.z > 0 && _vector4.z < 1 ) {

					_particle = getNextParticleInPool();
					_particle.x = _vector4.x / _vector4.w;
					_particle.y = _vector4.y / _vector4.w;
					_particle.z = _vector4.z;

					_particle.rotation = object.rotation.z;

					_particle.scale.x = object.scale.x * Math.abs( _particle.x - ( _vector4.x + camera.projectionMatrix.elements[0] ) / ( _vector4.w + camera.projectionMatrix.elements[12] ) );
					_particle.scale.y = object.scale.y * Math.abs( _particle.y - ( _vector4.y + camera.projectionMatrix.elements[5] ) / ( _vector4.w + camera.projectionMatrix.elements[13] ) );

					_particle.material = object.material;

					_renderData.elements.push( _particle );

				}

			}

		}

		sort && _renderData.elements.sort( painterSort );

		return _renderData;

	};

	// Pools

	function getNextObjectInPool() {

		var object = _objectPool[ _objectCount ] = _objectPool[ _objectCount ] || new THREE.RenderableObject();

		_objectCount ++;

		return object;

	}

	function getNextVertexInPool() {

		var vertex = _vertexPool[ _vertexCount ] = _vertexPool[ _vertexCount ] || new THREE.RenderableVertex();

		_vertexCount ++;

		return vertex;

	}

	function getNextFace3InPool() {

		var face = _face3Pool[ _face3Count ] = _face3Pool[ _face3Count ] || new THREE.RenderableFace3();

		_face3Count ++;

		return face;

	}

	function getNextFace4InPool() {

		var face = _face4Pool[ _face4Count ] = _face4Pool[ _face4Count ] || new THREE.RenderableFace4();

		_face4Count ++;

		return face;

	}

	function getNextLineInPool() {

		var line = _linePool[ _lineCount ] = _linePool[ _lineCount ] || new THREE.RenderableLine();

		_lineCount ++;

		return line;

	}

	function getNextParticleInPool() {

		var particle = _particlePool[ _particleCount ] = _particlePool[ _particleCount ] || new THREE.RenderableParticle();
		_particleCount ++;
		return particle;

	}

	//

	function painterSort( a, b ) {

		return b.z - a.z;

	}

	function clipLine( s1, s2 ) {

		var alpha1 = 0, alpha2 = 1,

		// Calculate the boundary coordinate of each vertex for the near and far clip planes,
		// Z = -1 and Z = +1, respectively.
		bc1near =  s1.z + s1.w,
		bc2near =  s2.z + s2.w,
		bc1far =  - s1.z + s1.w,
		bc2far =  - s2.z + s2.w;

		if ( bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0 ) {

			// Both vertices lie entirely within all clip planes.
			return true;

		} else if ( ( bc1near < 0 && bc2near < 0) || (bc1far < 0 && bc2far < 0 ) ) {

			// Both vertices lie entirely outside one of the clip planes.
			return false;

		} else {

			// The line segment spans at least one clip plane.

			if ( bc1near < 0 ) {

				// v1 lies outside the near plane, v2 inside
				alpha1 = Math.max( alpha1, bc1near / ( bc1near - bc2near ) );

			} else if ( bc2near < 0 ) {

				// v2 lies outside the near plane, v1 inside
				alpha2 = Math.min( alpha2, bc1near / ( bc1near - bc2near ) );

			}

			if ( bc1far < 0 ) {

				// v1 lies outside the far plane, v2 inside
				alpha1 = Math.max( alpha1, bc1far / ( bc1far - bc2far ) );

			} else if ( bc2far < 0 ) {

				// v2 lies outside the far plane, v2 inside
				alpha2 = Math.min( alpha2, bc1far / ( bc1far - bc2far ) );

			}

			if ( alpha2 < alpha1 ) {

				// The line segment spans two boundaries, but is outside both of them.
				// (This can't happen when we're only clipping against just near/far but good
				//  to leave the check here for future usage if other clip planes are added.)
				return false;

			} else {

				// Update the s1 and s2 vertices to match the clipped line segment.
				s1.lerpSelf( s2, alpha1 );
				s2.lerpSelf( s1, 1 - alpha2 );

				return true;

			}

		}

	}

};
/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Quaternion = function( x, y, z, w ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = ( w !== undefined ) ? w : 1;

};

THREE.Quaternion.prototype = {

	constructor: THREE.Quaternion,

	set: function ( x, y, z, w ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;

	},

	copy: function ( q ) {

		this.x = q.x;
		this.y = q.y;
		this.z = q.z;
		this.w = q.w;

		return this;

	},

	setFromEuler: function ( vector ) {

		var c = Math.PI / 360, // 0.5 * Math.PI / 360, // 0.5 is an optimization
		x = vector.x * c,
		y = vector.y * c,
		z = vector.z * c,

		c1 = Math.cos( y  ),
		s1 = Math.sin( y  ),
		c2 = Math.cos( -z ),
		s2 = Math.sin( -z ),
		c3 = Math.cos( x  ),
		s3 = Math.sin( x  ),

		c1c2 = c1 * c2,
		s1s2 = s1 * s2;

		this.w = c1c2 * c3  - s1s2 * s3;
	  	this.x = c1c2 * s3  + s1s2 * c3;
		this.y = s1 * c2 * c3 + c1 * s2 * s3;
		this.z = c1 * s2 * c3 - s1 * c2 * s3;

		return this;

	},

	setFromAxisAngle: function ( axis, angle ) {

		// from http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
		// axis have to be normalized

		var halfAngle = angle / 2,
			s = Math.sin( halfAngle );

		this.x = axis.x * s;
		this.y = axis.y * s;
		this.z = axis.z * s;
		this.w = Math.cos( halfAngle );

		return this;

	},

	setFromRotationMatrix: function ( m ) {

		// Adapted from: http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

		function copySign( a, b ) {

			return b < 0 ? -Math.abs( a ) : Math.abs( a );

		}

		var absQ = Math.pow( m.determinant(), 1.0 / 3.0 );
		this.w = Math.sqrt( Math.max( 0, absQ + m.elements[0] + m.elements[5] + m.elements[10] ) ) / 2;
		this.x = Math.sqrt( Math.max( 0, absQ + m.elements[0] - m.elements[5] - m.elements[10] ) ) / 2;
		this.y = Math.sqrt( Math.max( 0, absQ - m.elements[0] + m.elements[5] - m.elements[10] ) ) / 2;
		this.z = Math.sqrt( Math.max( 0, absQ - m.elements[0] - m.elements[5] + m.elements[10] ) ) / 2;
		this.x = copySign( this.x, ( m.elements[6] - m.elements[9] ) );
		this.y = copySign( this.y, ( m.elements[8] - m.elements[2] ) );
		this.z = copySign( this.z, ( m.elements[1] - m.elements[4] ) );
		this.normalize();

		return this;

	},

	calculateW : function () {

		this.w = - Math.sqrt( Math.abs( 1.0 - this.x * this.x - this.y * this.y - this.z * this.z ) );

		return this;

	},

	inverse: function () {

		this.x *= -1;
		this.y *= -1;
		this.z *= -1;

		return this;

	},

	length: function () {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w );

	},

	normalize: function () {

		var l = Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w );

		if ( l === 0 ) {

			this.x = 0;
			this.y = 0;
			this.z = 0;
			this.w = 0;

		} else {

			l = 1 / l;

			this.x = this.x * l;
			this.y = this.y * l;
			this.z = this.z * l;
			this.w = this.w * l;

		}

		return this;

	},

	multiply: function ( a, b ) {

		// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

		this.x =  a.x * b.w + a.y * b.z - a.z * b.y + a.w * b.x;
		this.y = -a.x * b.z + a.y * b.w + a.z * b.x + a.w * b.y;
		this.z =  a.x * b.y - a.y * b.x + a.z * b.w + a.w * b.z;
		this.w = -a.x * b.x - a.y * b.y - a.z * b.z + a.w * b.w;

		return this;

	},

	multiplySelf: function ( b ) {

		var qax = this.x, qay = this.y, qaz = this.z, qaw = this.w,
		qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

		this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

		return this;

	},

	multiplyVector3: function ( vector, dest ) {

		if ( !dest ) { dest = vector; }

		var x    = vector.x,  y  = vector.y,  z  = vector.z,
			qx   = this.x, qy = this.y, qz = this.z, qw = this.w;

		// calculate quat * vector

		var ix =  qw * x + qy * z - qz * y,
			iy =  qw * y + qz * x - qx * z,
			iz =  qw * z + qx * y - qy * x,
			iw = -qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		dest.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
		dest.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
		dest.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

		return dest;

	},

	clone: function () {

		return new THREE.Quaternion( this.x, this.y, this.z, this.w );

	}

}

THREE.Quaternion.slerp = function ( qa, qb, qm, t ) {

	// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

	var cosHalfTheta = qa.w * qb.w + qa.x * qb.x + qa.y * qb.y + qa.z * qb.z;

	if (cosHalfTheta < 0) {
		qm.w = -qb.w; qm.x = -qb.x; qm.y = -qb.y; qm.z = -qb.z;
		cosHalfTheta = -cosHalfTheta;
	} else {
		qm.copy(qb);
	}

	if ( Math.abs( cosHalfTheta ) >= 1.0 ) {

		qm.w = qa.w; qm.x = qa.x; qm.y = qa.y; qm.z = qa.z;
		return qm;

	}

	var halfTheta = Math.acos( cosHalfTheta ),
	sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

	if ( Math.abs( sinHalfTheta ) < 0.001 ) {

		qm.w = 0.5 * ( qa.w + qb.w );
		qm.x = 0.5 * ( qa.x + qb.x );
		qm.y = 0.5 * ( qa.y + qb.y );
		qm.z = 0.5 * ( qa.z + qb.z );

		return qm;

	}

	var ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
	ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

	qm.w = ( qa.w * ratioA + qm.w * ratioB );
	qm.x = ( qa.x * ratioA + qm.x * ratioB );
	qm.y = ( qa.y * ratioA + qm.y * ratioB );
	qm.z = ( qa.z * ratioA + qm.z * ratioB );

	return qm;

}
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Vertex = function () {

	console.warn( 'THREE.Vertex has been DEPRECATED. Use THREE.Vector3 instead.')

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Face3 = function ( a, b, c, normal, color, materialIndex ) {

	this.a = a;
	this.b = b;
	this.c = c;

	this.normal = normal instanceof THREE.Vector3 ? normal : new THREE.Vector3();
	this.vertexNormals = normal instanceof Array ? normal : [ ];

	this.color = color instanceof THREE.Color ? color : new THREE.Color();
	this.vertexColors = color instanceof Array ? color : [];

	this.vertexTangents = [];

	this.materialIndex = materialIndex;

	this.centroid = new THREE.Vector3();

};

THREE.Face3.prototype = {

	constructor: THREE.Face3,

	clone: function () {

		var face = new THREE.Face3( this.a, this.b, this.c );

		face.normal.copy( this.normal );
		face.color.copy( this.color );
		face.centroid.copy( this.centroid );

		face.materialIndex = this.materialIndex;

		var i, il;
		for ( i = 0, il = this.vertexNormals.length; i < il; i ++ ) face.vertexNormals[ i ] = this.vertexNormals[ i ].clone();
		for ( i = 0, il = this.vertexColors.length; i < il; i ++ ) face.vertexColors[ i ] = this.vertexColors[ i ].clone();
		for ( i = 0, il = this.vertexTangents.length; i < il; i ++ ) face.vertexTangents[ i ] = this.vertexTangents[ i ].clone();

		return face;

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Face4 = function ( a, b, c, d, normal, color, materialIndex ) {

	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;

	this.normal = normal instanceof THREE.Vector3 ? normal : new THREE.Vector3();
	this.vertexNormals = normal instanceof Array ? normal : [ ];

	this.color = color instanceof THREE.Color ? color : new THREE.Color();
	this.vertexColors = color instanceof Array ? color : [];

	this.vertexTangents = [];

	this.materialIndex = materialIndex;

	this.centroid = new THREE.Vector3();

};

THREE.Face4.prototype = {

	constructor: THREE.Face4,

	clone: function () {

		var face = new THREE.Face4( this.a, this.b, this.c, this.d );

		face.normal.copy( this.normal );
		face.color.copy( this.color );
		face.centroid.copy( this.centroid );

		face.materialIndex = this.materialIndex;

		var i, il;
		for ( i = 0, il = this.vertexNormals.length; i < il; i ++ ) face.vertexNormals[ i ] = this.vertexNormals[ i ].clone();
		for ( i = 0, il = this.vertexColors.length; i < il; i ++ ) face.vertexColors[ i ] = this.vertexColors[ i ].clone();
		for ( i = 0, il = this.vertexTangents.length; i < il; i ++ ) face.vertexTangents[ i ] = this.vertexTangents[ i ].clone();

		return face;

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.UV = function ( u, v ) {

	this.u = u || 0;
	this.v = v || 0;

};

THREE.UV.prototype = {

	constructor: THREE.UV,

	set: function ( u, v ) {

		this.u = u;
		this.v = v;

		return this;

	},

	copy: function ( uv ) {

		this.u = uv.u;
		this.v = uv.v;

		return this;

	},

	lerpSelf: function ( uv, alpha ) {

		this.u += ( uv.u - this.u ) * alpha;
		this.v += ( uv.v - this.v ) * alpha;

		return this;

	},

	clone: function () {

		return new THREE.UV( this.u, this.v );

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 */

THREE.Geometry = function () {

	this.id = THREE.GeometryCount ++;

	this.vertices = [];
	this.colors = []; // one-to-one vertex colors, used in ParticleSystem, Line and Ribbon

	this.materials = [];

	this.faces = [];

	this.faceUvs = [[]];
	this.faceVertexUvs = [[]];

	this.morphTargets = [];
	this.morphColors = [];
	this.morphNormals = [];

	this.skinWeights = [];
	this.skinIndices = [];

	this.boundingBox = null;
	this.boundingSphere = null;

	this.hasTangents = false;

	this.dynamic = false; // unless set to true the *Arrays will be deleted once sent to a buffer.

};

THREE.Geometry.prototype = {

	constructor : THREE.Geometry,

	applyMatrix: function ( matrix ) {

		var matrixRotation = new THREE.Matrix4();
		matrixRotation.extractRotation( matrix );

		for ( var i = 0, il = this.vertices.length; i < il; i ++ ) {

			var vertex = this.vertices[ i ];

			matrix.multiplyVector3( vertex );

		}

		for ( var i = 0, il = this.faces.length; i < il; i ++ ) {

			var face = this.faces[ i ];

			matrixRotation.multiplyVector3( face.normal );

			for ( var j = 0, jl = face.vertexNormals.length; j < jl; j ++ ) {

				matrixRotation.multiplyVector3( face.vertexNormals[ j ] );

			}

			matrix.multiplyVector3( face.centroid );

		}

	},

	computeCentroids: function () {

		var f, fl, face;

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];
			face.centroid.set( 0, 0, 0 );

			if ( face instanceof THREE.Face3 ) {

				face.centroid.addSelf( this.vertices[ face.a ] );
				face.centroid.addSelf( this.vertices[ face.b ] );
				face.centroid.addSelf( this.vertices[ face.c ] );
				face.centroid.divideScalar( 3 );

			} else if ( face instanceof THREE.Face4 ) {

				face.centroid.addSelf( this.vertices[ face.a ] );
				face.centroid.addSelf( this.vertices[ face.b ] );
				face.centroid.addSelf( this.vertices[ face.c ] );
				face.centroid.addSelf( this.vertices[ face.d ] );
				face.centroid.divideScalar( 4 );

			}

		}

	},

	computeFaceNormals: function () {

		var n, nl, v, vl, vertex, f, fl, face, vA, vB, vC,
		cb = new THREE.Vector3(), ab = new THREE.Vector3();

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			vA = this.vertices[ face.a ];
			vB = this.vertices[ face.b ];
			vC = this.vertices[ face.c ];

			cb.sub( vC, vB );
			ab.sub( vA, vB );
			cb.crossSelf( ab );

			if ( !cb.isZero() ) {

				cb.normalize();

			}

			face.normal.copy( cb );

		}

	},

	computeVertexNormals: function () {

		var v, vl, f, fl, face, vertices;

		// create internal buffers for reuse when calling this method repeatedly
		// (otherwise memory allocation / deallocation every frame is big resource hog)

		if ( this.__tmpVertices === undefined ) {

			this.__tmpVertices = new Array( this.vertices.length );
			vertices = this.__tmpVertices;

			for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

				vertices[ v ] = new THREE.Vector3();

			}

			for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

				face = this.faces[ f ];

				if ( face instanceof THREE.Face3 ) {

					face.vertexNormals = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];

				} else if ( face instanceof THREE.Face4 ) {

					face.vertexNormals = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];

				}

			}

		} else {

			vertices = this.__tmpVertices;

			for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

				vertices[ v ].set( 0, 0, 0 );

			}

		}

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			if ( face instanceof THREE.Face3 ) {

				vertices[ face.a ].addSelf( face.normal );
				vertices[ face.b ].addSelf( face.normal );
				vertices[ face.c ].addSelf( face.normal );

			} else if ( face instanceof THREE.Face4 ) {

				vertices[ face.a ].addSelf( face.normal );
				vertices[ face.b ].addSelf( face.normal );
				vertices[ face.c ].addSelf( face.normal );
				vertices[ face.d ].addSelf( face.normal );

			}

		}

		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			vertices[ v ].normalize();

		}

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			if ( face instanceof THREE.Face3 ) {

				face.vertexNormals[ 0 ].copy( vertices[ face.a ] );
				face.vertexNormals[ 1 ].copy( vertices[ face.b ] );
				face.vertexNormals[ 2 ].copy( vertices[ face.c ] );

			} else if ( face instanceof THREE.Face4 ) {

				face.vertexNormals[ 0 ].copy( vertices[ face.a ] );
				face.vertexNormals[ 1 ].copy( vertices[ face.b ] );
				face.vertexNormals[ 2 ].copy( vertices[ face.c ] );
				face.vertexNormals[ 3 ].copy( vertices[ face.d ] );

			}

		}

	},

	computeMorphNormals: function () {

		var i, il, f, fl, face;

		// save original normals
		// - create temp variables on first access
		//   otherwise just copy (for faster repeated calls)

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			if ( ! face.__originalFaceNormal ) {

				face.__originalFaceNormal = face.normal.clone();

			} else {

				face.__originalFaceNormal.copy( face.normal );

			}

			if ( ! face.__originalVertexNormals ) face.__originalVertexNormals = [];

			for ( i = 0, il = face.vertexNormals.length; i < il; i ++ ) {

				if ( ! face.__originalVertexNormals[ i ] ) {

					face.__originalVertexNormals[ i ] = face.vertexNormals[ i ].clone();

				} else {

					face.__originalVertexNormals[ i ].copy( face.vertexNormals[ i ] );

				}

			}

		}

		// use temp geometry to compute face and vertex normals for each morph

		var tmpGeo = new THREE.Geometry();
		tmpGeo.faces = this.faces;

		for ( i = 0, il = this.morphTargets.length; i < il; i ++ ) {

			// create on first access

			if ( ! this.morphNormals[ i ] ) {

				this.morphNormals[ i ] = {};
				this.morphNormals[ i ].faceNormals = [];
				this.morphNormals[ i ].vertexNormals = [];

				var dstNormalsFace = this.morphNormals[ i ].faceNormals;
				var dstNormalsVertex = this.morphNormals[ i ].vertexNormals;

				var faceNormal, vertexNormals;

				for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

					face = this.faces[ f ];

					faceNormal = new THREE.Vector3();

					if ( face instanceof THREE.Face3 ) {

						vertexNormals = { a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3() };

					} else {

						vertexNormals = { a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(), d: new THREE.Vector3() };

					}

					dstNormalsFace.push( faceNormal );
					dstNormalsVertex.push( vertexNormals );

				}

			}

			var morphNormals = this.morphNormals[ i ];

			// set vertices to morph target

			tmpGeo.vertices = this.morphTargets[ i ].vertices;

			// compute morph normals

			tmpGeo.computeFaceNormals();
			tmpGeo.computeVertexNormals();

			// store morph normals

			var faceNormal, vertexNormals;

			for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

				face = this.faces[ f ];

				faceNormal = morphNormals.faceNormals[ f ];
				vertexNormals = morphNormals.vertexNormals[ f ];

				faceNormal.copy( face.normal );

				if ( face instanceof THREE.Face3 ) {

					vertexNormals.a.copy( face.vertexNormals[ 0 ] );
					vertexNormals.b.copy( face.vertexNormals[ 1 ] );
					vertexNormals.c.copy( face.vertexNormals[ 2 ] );

				} else {

					vertexNormals.a.copy( face.vertexNormals[ 0 ] );
					vertexNormals.b.copy( face.vertexNormals[ 1 ] );
					vertexNormals.c.copy( face.vertexNormals[ 2 ] );
					vertexNormals.d.copy( face.vertexNormals[ 3 ] );

				}

			}

		}

		// restore original normals

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			face.normal = face.__originalFaceNormal;
			face.vertexNormals = face.__originalVertexNormals;

		}

	},

	computeTangents: function () {

		// based on http://www.terathon.com/code/tangent.html
		// tangents go to vertices

		var f, fl, v, vl, i, il, vertexIndex,
			face, uv, vA, vB, vC, uvA, uvB, uvC,
			x1, x2, y1, y2, z1, z2,
			s1, s2, t1, t2, r, t, test,
			tan1 = [], tan2 = [],
			sdir = new THREE.Vector3(), tdir = new THREE.Vector3(),
			tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(),
			n = new THREE.Vector3(), w;

		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			tan1[ v ] = new THREE.Vector3();
			tan2[ v ] = new THREE.Vector3();

		}

		function handleTriangle( context, a, b, c, ua, ub, uc ) {

			vA = context.vertices[ a ];
			vB = context.vertices[ b ];
			vC = context.vertices[ c ];

			uvA = uv[ ua ];
			uvB = uv[ ub ];
			uvC = uv[ uc ];

			x1 = vB.x - vA.x;
			x2 = vC.x - vA.x;
			y1 = vB.y - vA.y;
			y2 = vC.y - vA.y;
			z1 = vB.z - vA.z;
			z2 = vC.z - vA.z;

			s1 = uvB.u - uvA.u;
			s2 = uvC.u - uvA.u;
			t1 = uvB.v - uvA.v;
			t2 = uvC.v - uvA.v;

			r = 1.0 / ( s1 * t2 - s2 * t1 );
			sdir.set( ( t2 * x1 - t1 * x2 ) * r,
					  ( t2 * y1 - t1 * y2 ) * r,
					  ( t2 * z1 - t1 * z2 ) * r );
			tdir.set( ( s1 * x2 - s2 * x1 ) * r,
					  ( s1 * y2 - s2 * y1 ) * r,
					  ( s1 * z2 - s2 * z1 ) * r );

			tan1[ a ].addSelf( sdir );
			tan1[ b ].addSelf( sdir );
			tan1[ c ].addSelf( sdir );

			tan2[ a ].addSelf( tdir );
			tan2[ b ].addSelf( tdir );
			tan2[ c ].addSelf( tdir );

		}

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];
			uv = this.faceVertexUvs[ 0 ][ f ]; // use UV layer 0 for tangents

			if ( face instanceof THREE.Face3 ) {

				handleTriangle( this, face.a, face.b, face.c, 0, 1, 2 );

			} else if ( face instanceof THREE.Face4 ) {

				handleTriangle( this, face.a, face.b, face.d, 0, 1, 3 );
				handleTriangle( this, face.b, face.c, face.d, 1, 2, 3 );

			}

		}

		var faceIndex = [ 'a', 'b', 'c', 'd' ];

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			for ( i = 0; i < face.vertexNormals.length; i++ ) {

				n.copy( face.vertexNormals[ i ] );

				vertexIndex = face[ faceIndex[ i ] ];

				t = tan1[ vertexIndex ];

				// Gram-Schmidt orthogonalize

				tmp.copy( t );
				tmp.subSelf( n.multiplyScalar( n.dot( t ) ) ).normalize();

				// Calculate handedness

				tmp2.cross( face.vertexNormals[ i ], t );
				test = tmp2.dot( tan2[ vertexIndex ] );
				w = (test < 0.0) ? -1.0 : 1.0;

				face.vertexTangents[ i ] = new THREE.Vector4( tmp.x, tmp.y, tmp.z, w );

			}

		}

		this.hasTangents = true;

	},

	computeBoundingBox: function () {

		if ( ! this.boundingBox ) {

			this.boundingBox = { min: new THREE.Vector3(), max: new THREE.Vector3() };

		}

		if ( this.vertices.length > 0 ) {

			var position, firstPosition = this.vertices[ 0 ];

			this.boundingBox.min.copy( firstPosition );
			this.boundingBox.max.copy( firstPosition );

			var min = this.boundingBox.min,
				max = this.boundingBox.max;

			for ( var v = 1, vl = this.vertices.length; v < vl; v ++ ) {

				position = this.vertices[ v ];

				if ( position.x < min.x ) {

					min.x = position.x;

				} else if ( position.x > max.x ) {

					max.x = position.x;

				}

				if ( position.y < min.y ) {

					min.y = position.y;

				} else if ( position.y > max.y ) {

					max.y = position.y;

				}

				if ( position.z < min.z ) {

					min.z = position.z;

				} else if ( position.z > max.z ) {

					max.z = position.z;

				}

			}

		} else {

			this.boundingBox.min.set( 0, 0, 0 );
			this.boundingBox.max.set( 0, 0, 0 );

		}

	},

	computeBoundingSphere: function () {

		if ( ! this.boundingSphere ) this.boundingSphere = { radius: 0 };

		var radius, maxRadius = 0;

		for ( var v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			radius = this.vertices[ v ].length();
			if ( radius > maxRadius ) maxRadius = radius;

		}

		this.boundingSphere.radius = maxRadius;

	},

	/*
	 * Checks for duplicate vertices with hashmap.
	 * Duplicated vertices are removed
	 * and faces' vertices are updated.
	 */

	mergeVertices: function() {

		var verticesMap = {}; // Hashmap for looking up vertice by position coordinates (and making sure they are unique)
		var unique = [], changes = [];

		var v, key;
		var precisionPoints = 4; // number of decimal points, eg. 4 for epsilon of 0.0001
		var precision = Math.pow( 10, precisionPoints );
		var i,il, face;

		for ( i = 0, il = this.vertices.length; i < il; i ++ ) {

			v = this.vertices[ i ];
			key = [ Math.round( v.x * precision ), Math.round( v.y * precision ), Math.round( v.z * precision ) ].join( '_' );

			if ( verticesMap[ key ] === undefined ) {

				verticesMap[ key ] = i;
				unique.push( this.vertices[ i ] );
				changes[ i ] = unique.length - 1;

			} else {

				//console.log('Duplicate vertex found. ', i, ' could be using ', verticesMap[key]);
				changes[ i ] = changes[ verticesMap[ key ] ];

			}

		};


		// Start to patch face indices

		for( i = 0, il = this.faces.length; i < il; i ++ ) {

			face = this.faces[ i ];

			if ( face instanceof THREE.Face3 ) {

				face.a = changes[ face.a ];
				face.b = changes[ face.b ];
				face.c = changes[ face.c ];

			} else if ( face instanceof THREE.Face4 ) {

				face.a = changes[ face.a ];
				face.b = changes[ face.b ];
				face.c = changes[ face.c ];
				face.d = changes[ face.d ];

			}

		}

		// Use unique set of vertices

		this.vertices = unique;

	}

};

THREE.GeometryCount = 0;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Camera = function () {

	THREE.Object3D.call( this );

	this.matrixWorldInverse = new THREE.Matrix4();

	this.projectionMatrix = new THREE.Matrix4();
	this.projectionMatrixInverse = new THREE.Matrix4();

};

THREE.Camera.prototype = new THREE.Object3D();
THREE.Camera.prototype.constructor = THREE.Camera;

THREE.Camera.prototype.lookAt = function ( vector ) {

	// TODO: Add hierarchy support.

	this.matrix.lookAt( this.position, vector, this.up );

	if ( this.rotationAutoUpdate ) {

		this.rotation.getRotationFromMatrix( this.matrix );

	}

};
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.OrthographicCamera = function ( left, right, top, bottom, near, far ) {

	THREE.Camera.call( this );

	this.left = left;
	this.right = right;
	this.top = top;
	this.bottom = bottom;

	this.near = ( near !== undefined ) ? near : 0.1;
	this.far = ( far !== undefined ) ? far : 2000;

	this.updateProjectionMatrix();

};

THREE.OrthographicCamera.prototype = new THREE.Camera();
THREE.OrthographicCamera.prototype.constructor = THREE.OrthographicCamera;

THREE.OrthographicCamera.prototype.updateProjectionMatrix = function () {

	this.projectionMatrix.makeOrthographic( this.left, this.right, this.top, this.bottom, this.near, this.far );

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author greggman / http://games.greggman.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 */

THREE.PerspectiveCamera = function ( fov, aspect, near, far ) {

	THREE.Camera.call( this );

	this.fov = fov !== undefined ? fov : 50;
	this.aspect = aspect !== undefined ? aspect : 1;
	this.near = near !== undefined ? near : 0.1;
	this.far = far !== undefined ? far : 2000;

	this.updateProjectionMatrix();

};

THREE.PerspectiveCamera.prototype = new THREE.Camera();
THREE.PerspectiveCamera.prototype.constructor = THREE.PerspectiveCamera;


/**
 * Uses Focal Length (in mm) to estimate and set FOV
 * 35mm (fullframe) camera is used if frame size is not specified;
 * Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html
 */

THREE.PerspectiveCamera.prototype.setLens = function ( focalLength, frameHeight ) {

	frameHeight = frameHeight !== undefined ? frameHeight : 24;

	this.fov = 2 * Math.atan( frameHeight / ( focalLength * 2 ) ) * ( 180 / Math.PI );
	this.updateProjectionMatrix();

}


/**
 * Sets an offset in a larger frustum. This is useful for multi-window or
 * multi-monitor/multi-machine setups.
 *
 * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
 * the monitors are in grid like this
 *
 *   +---+---+---+
 *   | A | B | C |
 *   +---+---+---+
 *   | D | E | F |
 *   +---+---+---+
 *
 * then for each monitor you would call it like this
 *
 *   var w = 1920;
 *   var h = 1080;
 *   var fullWidth = w * 3;
 *   var fullHeight = h * 2;
 *
 *   --A--
 *   camera.setOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
 *   --B--
 *   camera.setOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
 *   --C--
 *   camera.setOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
 *   --D--
 *   camera.setOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
 *   --E--
 *   camera.setOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
 *   --F--
 *   camera.setOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
 *
 *   Note there is no reason monitors have to be the same size or in a grid.
 */

THREE.PerspectiveCamera.prototype.setViewOffset = function ( fullWidth, fullHeight, x, y, width, height ) {

	this.fullWidth = fullWidth;
	this.fullHeight = fullHeight;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	this.updateProjectionMatrix();

};


THREE.PerspectiveCamera.prototype.updateProjectionMatrix = function () {

	if ( this.fullWidth ) {

		var aspect = this.fullWidth / this.fullHeight;
		var top = Math.tan( this.fov * Math.PI / 360 ) * this.near;
		var bottom = -top;
		var left = aspect * bottom;
		var right = aspect * top;
		var width = Math.abs( right - left );
		var height = Math.abs( top - bottom );

		this.projectionMatrix.makeFrustum(
			left + this.x * width / this.fullWidth,
			left + ( this.x + this.width ) * width / this.fullWidth,
			top - ( this.y + this.height ) * height / this.fullHeight,
			top - this.y * height / this.fullHeight,
			this.near,
			this.far
		);

	} else {

		this.projectionMatrix.makePerspective( this.fov, this.aspect, this.near, this.far );

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
 
THREE.Light = function ( hex ) {

	THREE.Object3D.call( this );

	this.color = new THREE.Color( hex );

};

THREE.Light.prototype = new THREE.Object3D();
THREE.Light.prototype.constructor = THREE.Light;
THREE.Light.prototype.supr = THREE.Object3D.prototype;
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.AmbientLight = function ( hex ) {

	THREE.Light.call( this, hex );

};

THREE.AmbientLight.prototype = new THREE.Light();
THREE.AmbientLight.prototype.constructor = THREE.AmbientLight; 
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.DirectionalLight = function ( hex, intensity, distance ) {

	THREE.Light.call( this, hex );

	this.position = new THREE.Vector3( 0, 1, 0 );
	this.target = new THREE.Object3D();

	this.intensity = ( intensity !== undefined ) ? intensity : 1;
	this.distance = ( distance !== undefined ) ? distance : 0;

	this.castShadow = false;
	this.onlyShadow = false;

	//

	this.shadowCameraNear = 50;
	this.shadowCameraFar = 5000;

	this.shadowCameraLeft = -500;
	this.shadowCameraRight = 500;
	this.shadowCameraTop = 500;
	this.shadowCameraBottom = -500;

	this.shadowCameraVisible = false;

	this.shadowBias = 0;
	this.shadowDarkness = 0.5;

	this.shadowMapWidth = 512;
	this.shadowMapHeight = 512;

	//

	this.shadowCascade = false;

	this.shadowCascadeOffset = new THREE.Vector3( 0, 0, -1000 );
	this.shadowCascadeCount = 2;

	this.shadowCascadeBias = [ 0, 0, 0 ];
	this.shadowCascadeWidth = [ 512, 512, 512 ];
	this.shadowCascadeHeight = [ 512, 512, 512 ];

	this.shadowCascadeNearZ = [ -1.000, 0.990, 0.998 ];
	this.shadowCascadeFarZ  = [  0.990, 0.998, 1.000 ];

	this.shadowCascadeArray = [];

	//

	this.shadowMap = null;
	this.shadowMapSize = null;
	this.shadowCamera = null;
	this.shadowMatrix = null;

};

THREE.DirectionalLight.prototype = new THREE.Light();
THREE.DirectionalLight.prototype.constructor = THREE.DirectionalLight;
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.PointLight = function ( hex, intensity, distance ) {

	THREE.Light.call( this, hex );

	this.position = new THREE.Vector3( 0, 0, 0 );
	this.intensity = ( intensity !== undefined ) ? intensity : 1;
	this.distance = ( distance !== undefined ) ? distance : 0;

};

THREE.PointLight.prototype = new THREE.Light();
THREE.PointLight.prototype.constructor = THREE.PointLight;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Material = function ( parameters ) {

	parameters = parameters || {};

	this.id = THREE.MaterialCount ++;

	this.name = '';

	this.opacity = parameters.opacity !== undefined ? parameters.opacity : 1;
	this.transparent = parameters.transparent !== undefined ? parameters.transparent : false;

	this.blending = parameters.blending !== undefined ? parameters.blending : THREE.NormalBlending;

	this.blendSrc = parameters.blendSrc !== undefined ? parameters.blendSrc : THREE.SrcAlphaFactor;
	this.blendDst = parameters.blendDst !== undefined ? parameters.blendDst : THREE.OneMinusSrcAlphaFactor;
	this.blendEquation = parameters.blendEquation !== undefined ? parameters.blendEquation : THREE.AddEquation;

	this.depthTest = parameters.depthTest !== undefined ? parameters.depthTest : true;
	this.depthWrite = parameters.depthWrite !== undefined ? parameters.depthWrite : true;

	this.polygonOffset = parameters.polygonOffset !== undefined ? parameters.polygonOffset : false;
	this.polygonOffsetFactor = parameters.polygonOffsetFactor !== undefined ? parameters.polygonOffsetFactor : 0;
	this.polygonOffsetUnits = parameters.polygonOffsetUnits !== undefined ? parameters.polygonOffsetUnits : 0;

	this.alphaTest = parameters.alphaTest !== undefined ? parameters.alphaTest : 0;

	this.overdraw = parameters.overdraw !== undefined ? parameters.overdraw : false; // Boolean for fixing antialiasing gaps in CanvasRenderer

	this.needsUpdate = true;

}

THREE.MaterialCount = 0;

// shading

THREE.NoShading = 0;
THREE.FlatShading = 1;
THREE.SmoothShading = 2;

// colors

THREE.NoColors = 0;
THREE.FaceColors = 1;
THREE.VertexColors = 2;

// blending modes

THREE.NoBlending = 0;
THREE.NormalBlending = 1;
THREE.AdditiveBlending = 2;
THREE.SubtractiveBlending = 3;
THREE.MultiplyBlending = 4;
THREE.AdditiveAlphaBlending = 5;
THREE.CustomBlending = 6;

// custom blending equations
// (numbers start from 100 not to clash with other
//  mappings to OpenGL constants defined in Texture.js)

THREE.AddEquation = 100;
THREE.SubtractEquation = 101;
THREE.ReverseSubtractEquation = 102;

// custom blending destination factors

THREE.ZeroFactor = 200;
THREE.OneFactor = 201;
THREE.SrcColorFactor = 202;
THREE.OneMinusSrcColorFactor = 203;
THREE.SrcAlphaFactor = 204;
THREE.OneMinusSrcAlphaFactor = 205;
THREE.DstAlphaFactor = 206;
THREE.OneMinusDstAlphaFactor = 207;

// custom blending source factors

//THREE.ZeroFactor = 200;
//THREE.OneFactor = 201;
//THREE.SrcAlphaFactor = 204;
//THREE.OneMinusSrcAlphaFactor = 205;
//THREE.DstAlphaFactor = 206;
//THREE.OneMinusDstAlphaFactor = 207;
THREE.DstColorFactor = 208;
THREE.OneMinusDstColorFactor = 209;
THREE.SrcAlphaSaturateFactor = 210;

/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *
 *  linewidth: <float>,
 *  linecap: "round",
 *  linejoin: "round",
 *
 *  vertexColors: <bool>
 *
 *  fog: <bool>
 * }
 */

THREE.LineBasicMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	this.color = parameters.color !== undefined ? new THREE.Color( parameters.color ) : new THREE.Color( 0xffffff );

	this.linewidth = parameters.linewidth !== undefined ? parameters.linewidth : 1;
	this.linecap = parameters.linecap !== undefined ? parameters.linecap : 'round';
	this.linejoin = parameters.linejoin !== undefined ? parameters.linejoin : 'round';

	this.vertexColors = parameters.vertexColors ? parameters.vertexColors : false;

	this.fog = parameters.fog !== undefined ? parameters.fog : true;

};

THREE.LineBasicMaterial.prototype = new THREE.Material();
THREE.LineBasicMaterial.prototype.constructor = THREE.LineBasicMaterial;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  lightMap: new THREE.Texture( <Image> ),
 *
 *  envMap: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refractionRatio: <float>,
 *
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  vertexColors: THREE.NoColors / THREE.VertexColors / THREE.FaceColors,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *
 *	fog: <bool>
 * }
 */

THREE.MeshBasicMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	// color property represents emissive for MeshBasicMaterial

	this.color = parameters.color !== undefined ? new THREE.Color( parameters.color ) : new THREE.Color( 0xffffff );

	this.map = parameters.map !== undefined ? parameters.map : null;

	this.lightMap = parameters.lightMap !== undefined ? parameters.lightMap : null;

	this.envMap = parameters.envMap !== undefined ? parameters.envMap : null;
	this.combine = parameters.combine !== undefined ? parameters.combine : THREE.MultiplyOperation;
	this.reflectivity = parameters.reflectivity !== undefined ? parameters.reflectivity : 1;
	this.refractionRatio = parameters.refractionRatio !== undefined ? parameters.refractionRatio : 0.98;

	this.fog = parameters.fog !== undefined ? parameters.fog : true;

	this.shading = parameters.shading !== undefined ? parameters.shading : THREE.SmoothShading;

	this.wireframe = parameters.wireframe !== undefined ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth !== undefined ? parameters.wireframeLinewidth : 1;
	this.wireframeLinecap = parameters.wireframeLinecap !== undefined ? parameters.wireframeLinecap : 'round';
	this.wireframeLinejoin = parameters.wireframeLinejoin !== undefined ? parameters.wireframeLinejoin : 'round';

	this.vertexColors = parameters.vertexColors !== undefined ? parameters.vertexColors : THREE.NoColors;

	this.skinning = parameters.skinning !== undefined ? parameters.skinning : false;
	this.morphTargets = parameters.morphTargets !== undefined ? parameters.morphTargets : false;

};

THREE.MeshBasicMaterial.prototype = new THREE.Material();
THREE.MeshBasicMaterial.prototype.constructor = THREE.MeshBasicMaterial;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  ambient: <hex>,
 *  emissive: <hex>,
 *  opacity: <float>,
 *
 *  map: new THREE.Texture( <Image> ),
 *
 *  lightMap: new THREE.Texture( <Image> ),
 *
 *  envMap: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refractionRatio: <float>,
 *
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  vertexColors: THREE.NoColors / THREE.VertexColors / THREE.FaceColors,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *  morphNormals: <bool>,
 *
 *	fog: <bool>
 * }
 */

THREE.MeshLambertMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	// color property represents diffuse for MeshLambertMaterial

	this.color = parameters.color !== undefined ? new THREE.Color( parameters.color ) : new THREE.Color( 0xffffff );
	this.ambient = parameters.ambient !== undefined ? new THREE.Color( parameters.ambient ) : new THREE.Color( 0xffffff );
	this.emissive = parameters.emissive !== undefined ? new THREE.Color( parameters.emissive ) : new THREE.Color( 0x000000 );

	this.wrapAround = parameters.wrapAround !== undefined ? parameters.wrapAround: false;
	this.wrapRGB = new THREE.Vector3( 1, 1, 1 );

	this.map = parameters.map !== undefined ? parameters.map : null;

	this.lightMap = parameters.lightMap !== undefined ? parameters.lightMap : null;

	this.envMap = parameters.envMap !== undefined ? parameters.envMap : null;
	this.combine = parameters.combine !== undefined ? parameters.combine : THREE.MultiplyOperation;
	this.reflectivity = parameters.reflectivity !== undefined ? parameters.reflectivity : 1;
	this.refractionRatio = parameters.refractionRatio !== undefined ? parameters.refractionRatio : 0.98;

	this.fog = parameters.fog !== undefined ? parameters.fog : true;

	this.shading = parameters.shading !== undefined ? parameters.shading : THREE.SmoothShading;

	this.wireframe = parameters.wireframe !== undefined ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth !== undefined ? parameters.wireframeLinewidth : 1;
	this.wireframeLinecap = parameters.wireframeLinecap !== undefined ? parameters.wireframeLinecap : 'round';
	this.wireframeLinejoin = parameters.wireframeLinejoin !== undefined ? parameters.wireframeLinejoin : 'round';

	this.vertexColors = parameters.vertexColors !== undefined ? parameters.vertexColors : THREE.NoColors;

	this.skinning = parameters.skinning !== undefined ? parameters.skinning : false;
	this.morphTargets = parameters.morphTargets !== undefined ? parameters.morphTargets : false;
	this.morphNormals = parameters.morphNormals !== undefined ? parameters.morphNormals : false;

};

THREE.MeshLambertMaterial.prototype = new THREE.Material();
THREE.MeshLambertMaterial.prototype.constructor = THREE.MeshLambertMaterial;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  ambient: <hex>,
 *  emissive: <hex>,
 *  specular: <hex>,
 *  shininess: <float>,
 *  opacity: <float>,
 *
 *  map: new THREE.Texture( <Image> ),
 *
 *  lightMap: new THREE.Texture( <Image> ),
 *
 *  envMap: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refractionRatio: <float>,
 *
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  vertexColors: THREE.NoColors / THREE.VertexColors / THREE.FaceColors,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *  morphNormals: <bool>,
 *
 *	fog: <bool>
 * }
 */

THREE.MeshPhongMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	// color property represents diffuse for MeshPhongMaterial

	this.color = parameters.color !== undefined ? new THREE.Color( parameters.color ) : new THREE.Color( 0xffffff );
	this.ambient = parameters.ambient !== undefined ? new THREE.Color( parameters.ambient ) : new THREE.Color( 0xffffff );
	this.emissive = parameters.emissive !== undefined ? new THREE.Color( parameters.emissive ) : new THREE.Color( 0x000000 );
	this.specular = parameters.specular !== undefined ? new THREE.Color( parameters.specular ) : new THREE.Color( 0x111111 );
	this.shininess = parameters.shininess !== undefined ? parameters.shininess : 30;

	this.metal = parameters.metal !== undefined ? parameters.metal : false;
	this.perPixel = parameters.perPixel !== undefined ? parameters.perPixel : false;

	this.wrapAround = parameters.wrapAround !== undefined ? parameters.wrapAround: false;
	this.wrapRGB = new THREE.Vector3( 1, 1, 1 );

	this.map = parameters.map !== undefined ? parameters.map : null;

	this.lightMap = parameters.lightMap !== undefined ? parameters.lightMap : null;

	this.envMap = parameters.envMap !== undefined ? parameters.envMap : null;
	this.combine = parameters.combine !== undefined ? parameters.combine : THREE.MultiplyOperation;
	this.reflectivity = parameters.reflectivity !== undefined ? parameters.reflectivity : 1;
	this.refractionRatio = parameters.refractionRatio !== undefined ? parameters.refractionRatio : 0.98;

	this.fog = parameters.fog !== undefined ? parameters.fog : true;

	this.shading = parameters.shading !== undefined ? parameters.shading : THREE.SmoothShading;

	this.wireframe = parameters.wireframe !== undefined ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth !== undefined ? parameters.wireframeLinewidth : 1;
	this.wireframeLinecap = parameters.wireframeLinecap !== undefined ? parameters.wireframeLinecap : 'round';
	this.wireframeLinejoin = parameters.wireframeLinejoin !== undefined ? parameters.wireframeLinejoin : 'round';

	this.vertexColors = parameters.vertexColors !== undefined ? parameters.vertexColors : THREE.NoColors;

	this.skinning = parameters.skinning !== undefined ? parameters.skinning : false;
	this.morphTargets = parameters.morphTargets !== undefined ? parameters.morphTargets : false;
	this.morphNormals = parameters.morphNormals !== undefined ? parameters.morphNormals : false;

};

THREE.MeshPhongMaterial.prototype = new THREE.Material();
THREE.MeshPhongMaterial.prototype.constructor = THREE.MeshPhongMaterial;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  opacity: <float>,
 
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 * } 
 */

THREE.MeshDepthMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	this.shading = parameters.shading !== undefined ? parameters.shading : THREE.SmoothShading; // doesn't really apply here, normals are not used

	this.wireframe = parameters.wireframe !== undefined ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth !== undefined ? parameters.wireframeLinewidth : 1;

};

THREE.MeshDepthMaterial.prototype = new THREE.Material();
THREE.MeshDepthMaterial.prototype.constructor = THREE.MeshDepthMaterial;
/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  opacity: <float>,
 
 *  shading: THREE.FlatShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 * }
 */

THREE.MeshNormalMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	this.shading = parameters.shading ? parameters.shading : THREE.FlatShading;

	this.wireframe = parameters.wireframe ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth ? parameters.wireframeLinewidth : 1;

};

THREE.MeshNormalMaterial.prototype = new THREE.Material();
THREE.MeshNormalMaterial.prototype.constructor = THREE.MeshNormalMaterial;
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.MeshFaceMaterial = function () {

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  size: <float>,
 *
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *
 *  vertexColors: <bool>,
 *
 *  fog: <bool>
 * }
 */

THREE.ParticleBasicMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	this.color = parameters.color !== undefined ? new THREE.Color( parameters.color ) : new THREE.Color( 0xffffff );

	this.map = parameters.map !== undefined ? parameters.map : null;

	this.size = parameters.size !== undefined ? parameters.size : 1;
	this.sizeAttenuation = parameters.sizeAttenuation !== undefined ? parameters.sizeAttenuation : true;

	this.vertexColors = parameters.vertexColors !== undefined ? parameters.vertexColors : false;

	this.fog = parameters.fog !== undefined ? parameters.fog : true;

};

THREE.ParticleBasicMaterial.prototype = new THREE.Material();
THREE.ParticleBasicMaterial.prototype.constructor = THREE.ParticleBasicMaterial;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 */

THREE.Texture = function ( image, mapping, wrapS, wrapT, magFilter, minFilter, format, type ) {

	this.id = THREE.TextureCount ++;

	this.image = image;

	this.mapping = mapping !== undefined ? mapping : new THREE.UVMapping();

	this.wrapS = wrapS !== undefined ? wrapS : THREE.ClampToEdgeWrapping;
	this.wrapT = wrapT !== undefined ? wrapT : THREE.ClampToEdgeWrapping;

	this.magFilter = magFilter !== undefined ? magFilter : THREE.LinearFilter;
	this.minFilter = minFilter !== undefined ? minFilter : THREE.LinearMipMapLinearFilter;

	this.format = format !== undefined ? format : THREE.RGBAFormat;
	this.type = type !== undefined ? type : THREE.UnsignedByteType;

	this.offset = new THREE.Vector2( 0, 0 );
	this.repeat = new THREE.Vector2( 1, 1 );

	this.generateMipmaps = true;
	this.premultiplyAlpha = false;

	this.needsUpdate = false;
	this.onUpdate = null;

};

THREE.Texture.prototype = {

	constructor: THREE.Texture,

	clone: function () {

		var clonedTexture = new THREE.Texture( this.image, this.mapping, this.wrapS, this.wrapT, this.magFilter, this.minFilter, this.format, this.type );

		clonedTexture.offset.copy( this.offset );
		clonedTexture.repeat.copy( this.repeat );

		return clonedTexture;

	}

};

THREE.TextureCount = 0;

THREE.MultiplyOperation = 0;
THREE.MixOperation = 1;

// Mapping modes

THREE.UVMapping = function () {};

THREE.CubeReflectionMapping = function () {};
THREE.CubeRefractionMapping = function () {};

THREE.SphericalReflectionMapping = function () {};
THREE.SphericalRefractionMapping = function () {};

// Wrapping modes

THREE.RepeatWrapping = 0;
THREE.ClampToEdgeWrapping = 1;
THREE.MirroredRepeatWrapping = 2;

// Filters

THREE.NearestFilter = 3;
THREE.NearestMipMapNearestFilter = 4;
THREE.NearestMipMapLinearFilter = 5;
THREE.LinearFilter = 6;
THREE.LinearMipMapNearestFilter = 7;
THREE.LinearMipMapLinearFilter = 8;

// Types

THREE.ByteType = 9;
THREE.UnsignedByteType = 10;
THREE.ShortType = 11;
THREE.UnsignedShortType = 12;
THREE.IntType = 13;
THREE.UnsignedIntType = 14;
THREE.FloatType = 15;

// Formats

THREE.AlphaFormat = 16;
THREE.RGBFormat = 17;
THREE.RGBAFormat = 18;
THREE.LuminanceFormat = 19;
THREE.LuminanceAlphaFormat = 20;
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.DataTexture = function ( data, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter ) {

	THREE.Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type );

	this.image = { data: data, width: width, height: height };

};

THREE.DataTexture.prototype = new THREE.Texture();
THREE.DataTexture.prototype.constructor = THREE.DataTexture;

THREE.DataTexture.prototype.clone = function () {

	var clonedTexture = new THREE.DataTexture( this.image.data,  this.image.width, this.image.height, this.format, this.type, this.mapping, this.wrapS, this.wrapT, this.magFilter, this.minFilter );

	clonedTexture.offset.copy( this.offset );
	clonedTexture.repeat.copy( this.repeat );

	return clonedTexture;

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Particle = function ( material ) {

	THREE.Object3D.call( this );

	this.material = material;

};

THREE.Particle.prototype = new THREE.Object3D();
THREE.Particle.prototype.constructor = THREE.Particle;
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Line = function ( geometry, material, type ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.material = ( material !== undefined ) ? material : new THREE.LineBasicMaterial( { color: Math.random() * 0xffffff } );
	this.type = ( type !== undefined ) ? type : THREE.LineStrip;

	if ( this.geometry ) {

		if ( ! this.geometry.boundingSphere ) {

			this.geometry.computeBoundingSphere();

		}

	}

};

THREE.LineStrip = 0;
THREE.LinePieces = 1;

THREE.Line.prototype = new THREE.Object3D();
THREE.Line.prototype.constructor = THREE.Line;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Mesh = function ( geometry, material ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.material = ( material !== undefined ) ? material : new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, wireframe: true } );

	if ( this.geometry ) {

		// calc bound radius

		if( ! this.geometry.boundingSphere ) {

			this.geometry.computeBoundingSphere();

		}

		this.boundRadius = geometry.boundingSphere.radius;


		// setup morph targets

		if( this.geometry.morphTargets.length ) {

			this.morphTargetBase = -1;
			this.morphTargetForcedOrder = [];
			this.morphTargetInfluences = [];
			this.morphTargetDictionary = {};

			for( var m = 0; m < this.geometry.morphTargets.length; m ++ ) {

				this.morphTargetInfluences.push( 0 );
				this.morphTargetDictionary[ this.geometry.morphTargets[ m ].name ] = m;

			}

		}

	}

}

THREE.Mesh.prototype = new THREE.Object3D();
THREE.Mesh.prototype.constructor = THREE.Mesh;
THREE.Mesh.prototype.supr = THREE.Object3D.prototype;


/*
 * Get Morph Target Index by Name
 */

THREE.Mesh.prototype.getMorphTargetIndexByName = function( name ) {

	if ( this.morphTargetDictionary[ name ] !== undefined ) {

		return this.morphTargetDictionary[ name ];
	}

	console.log( "THREE.Mesh.getMorphTargetIndexByName: morph target " + name + " does not exist. Returning 0." );
	return 0;

}
/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Bone = function( belongsToSkin ) {

	THREE.Object3D.call( this );

	this.skin = belongsToSkin;
	this.skinMatrix = new THREE.Matrix4();

};

THREE.Bone.prototype = new THREE.Object3D();
THREE.Bone.prototype.constructor = THREE.Bone;
THREE.Bone.prototype.supr = THREE.Object3D.prototype;


THREE.Bone.prototype.update = function( parentSkinMatrix, forceUpdate ) {

	// update local

	if ( this.matrixAutoUpdate ) {

		forceUpdate |= this.updateMatrix();

	}

	// update skin matrix

	if ( forceUpdate || this.matrixWorldNeedsUpdate ) {

		if( parentSkinMatrix ) {

			this.skinMatrix.multiply( parentSkinMatrix, this.matrix );

		} else {

			this.skinMatrix.copy( this.matrix );

		}

		this.matrixWorldNeedsUpdate = false;
		forceUpdate = true;

	}

	// update children

	var child, i, l = this.children.length;

	for ( i = 0; i < l; i ++ ) {

		this.children[ i ].update( this.skinMatrix, forceUpdate );

	}

};

/**
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Sprite = function ( parameters ) {

	THREE.Object3D.call( this );

	this.color = ( parameters.color !== undefined ) ? new THREE.Color( parameters.color ) : new THREE.Color( 0xffffff );
	this.map = ( parameters.map !== undefined ) ? parameters.map : new THREE.Texture();

	this.blending = ( parameters.blending !== undefined ) ? parameters.blending : THREE.NormalBlending;

	this.blendSrc = parameters.blendSrc !== undefined ? parameters.blendSrc : THREE.SrcAlphaFactor;
	this.blendDst = parameters.blendDst !== undefined ? parameters.blendDst : THREE.OneMinusSrcAlphaFactor;
	this.blendEquation = parameters.blendEquation !== undefined ? parameters.blendEquation : THREE.AddEquation;

	this.useScreenCoordinates = ( parameters.useScreenCoordinates !== undefined ) ? parameters.useScreenCoordinates : true;
	this.mergeWith3D = ( parameters.mergeWith3D !== undefined ) ? parameters.mergeWith3D : !this.useScreenCoordinates;
	this.affectedByDistance = ( parameters.affectedByDistance !== undefined ) ? parameters.affectedByDistance : !this.useScreenCoordinates;
	this.scaleByViewport = ( parameters.scaleByViewport !== undefined ) ? parameters.scaleByViewport : !this.affectedByDistance;
	this.alignment = ( parameters.alignment instanceof THREE.Vector2 ) ? parameters.alignment : THREE.SpriteAlignment.center;

	this.rotation3d = this.rotation;
	this.rotation = 0;
	this.opacity = 1;

	this.uvOffset = new THREE.Vector2( 0, 0 );
	this.uvScale  = new THREE.Vector2( 1, 1 );

};

THREE.Sprite.prototype = new THREE.Object3D();
THREE.Sprite.prototype.constructor = THREE.Sprite;


/*
 * Custom update matrix
 */

THREE.Sprite.prototype.updateMatrix = function () {

	this.matrix.setPosition( this.position );

	this.rotation3d.set( 0, 0, this.rotation );
	this.matrix.setRotationFromEuler( this.rotation3d );

	if ( this.scale.x !== 1 || this.scale.y !== 1 ) {

		this.matrix.scale( this.scale );
		this.boundRadiusScale = Math.max( this.scale.x, this.scale.y );

	}

	this.matrixWorldNeedsUpdate = true;

};

/*
 * Alignment
 */

THREE.SpriteAlignment = {};
THREE.SpriteAlignment.topLeft = new THREE.Vector2( 1, -1 );
THREE.SpriteAlignment.topCenter = new THREE.Vector2( 0, -1 );
THREE.SpriteAlignment.topRight = new THREE.Vector2( -1, -1 );
THREE.SpriteAlignment.centerLeft = new THREE.Vector2( 1, 0 );
THREE.SpriteAlignment.center = new THREE.Vector2( 0, 0 );
THREE.SpriteAlignment.centerRight = new THREE.Vector2( -1, 0 );
THREE.SpriteAlignment.bottomLeft = new THREE.Vector2( 1, 1 );
THREE.SpriteAlignment.bottomCenter = new THREE.Vector2( 0, 1 );
THREE.SpriteAlignment.bottomRight = new THREE.Vector2( -1, 1 );
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Scene = function () {

	THREE.Object3D.call( this );

	this.fog = null;
	this.overrideMaterial = null;

	this.matrixAutoUpdate = false;

	this.__objects = [];
	this.__lights = [];

	this.__objectsAdded = [];
	this.__objectsRemoved = [];

};

THREE.Scene.prototype = new THREE.Object3D();
THREE.Scene.prototype.constructor = THREE.Scene;

THREE.Scene.prototype.__addObject = function ( object ) {

	if ( object instanceof THREE.Light ) {

		if ( this.__lights.indexOf( object ) === - 1 ) {

			this.__lights.push( object );

		}

	} else if ( !( object instanceof THREE.Camera || object instanceof THREE.Bone ) ) {

		if ( this.__objects.indexOf( object ) === - 1 ) {

			this.__objects.push( object );
			this.__objectsAdded.push( object );

			// check if previously removed

			var i = this.__objectsRemoved.indexOf( object );

			if ( i !== -1 ) {

				this.__objectsRemoved.splice( i, 1 );

			}

		}

	}

	for ( var c = 0; c < object.children.length; c ++ ) {

		this.__addObject( object.children[ c ] );

	}

};

THREE.Scene.prototype.__removeObject = function ( object ) {

	if ( object instanceof THREE.Light ) {

		var i = this.__lights.indexOf( object );

		if ( i !== -1 ) {

			this.__lights.splice( i, 1 );

		}

	} else if ( !( object instanceof THREE.Camera ) ) {

		var i = this.__objects.indexOf( object );

		if( i !== -1 ) {

			this.__objects.splice( i, 1 );
			this.__objectsRemoved.push( object );

			// check if previously added

			var ai = this.__objectsAdded.indexOf( object );

			if ( ai !== -1 ) {

				this.__objectsAdded.splice( ai, 1 );

			}

		}

	}

	for ( var c = 0; c < object.children.length; c ++ ) {

		this.__removeObject( object.children[ c ] );

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.SVGRenderer = function () {

	console.log( 'THREE.SVGRenderer', THREE.REVISION );

	var _this = this,
	_renderData, _elements, _lights,
	_projector = new THREE.Projector(),
	_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
	_svgWidth, _svgHeight, _svgWidthHalf, _svgHeightHalf,

	_v1, _v2, _v3, _v4,

	_clipRect = new THREE.Rectangle(),
	_bboxRect = new THREE.Rectangle(),

	_enableLighting = false,
	_color = new THREE.Color(),
	_ambientLight = new THREE.Color(),
	_directionalLights = new THREE.Color(),
	_pointLights = new THREE.Color(),

	_w, // z-buffer to w-buffer
	_vector3 = new THREE.Vector3(), // Needed for PointLight

	_svgPathPool = [], _svgCirclePool = [], _svgLinePool = [],
	_svgNode, _pathCount, _circleCount, _lineCount,
	_quality = 1;

	this.domElement = _svg;

	this.autoClear = true;
	this.sortObjects = true;
	this.sortElements = true;

	this.info = {

		render: {

			vertices: 0,
			faces: 0

		}

	}

	this.setQuality = function( quality ) {

		switch(quality) {

			case "high": _quality = 1; break;
			case "low": _quality = 0; break;

		}

	};

	this.setSize = function( width, height ) {

		_svgWidth = width; _svgHeight = height;
		_svgWidthHalf = _svgWidth / 2; _svgHeightHalf = _svgHeight / 2;

		_svg.setAttribute( 'viewBox', ( - _svgWidthHalf ) + ' ' + ( - _svgHeightHalf ) + ' ' + _svgWidth + ' ' + _svgHeight );
		_svg.setAttribute( 'width', _svgWidth );
		_svg.setAttribute( 'height', _svgHeight );

		_clipRect.set( - _svgWidthHalf, - _svgHeightHalf, _svgWidthHalf, _svgHeightHalf );

	};

	this.clear = function () {

		while ( _svg.childNodes.length > 0 ) {

			_svg.removeChild( _svg.childNodes[ 0 ] );

		}

	};

	this.render = function ( scene, camera ) {

		var e, el, element, material;

		this.autoClear && this.clear();

		_this.info.render.vertices = 0;
		_this.info.render.faces = 0;

		_renderData = _projector.projectScene( scene, camera, this.sortElements );
		_elements = _renderData.elements;
		_lights = _renderData.lights;

		_pathCount = 0; _circleCount = 0; _lineCount = 0;

		_enableLighting = _lights.length > 0;

		if ( _enableLighting ) {

			 calculateLights( _lights );

		}

		for ( e = 0, el = _elements.length; e < el; e ++ ) {

			element = _elements[ e ];

			material = element.material;
			material = material instanceof THREE.MeshFaceMaterial ? element.faceMaterial : material;

			if ( material == null || material.opacity == 0 ) continue;

			_bboxRect.empty();

			if ( element instanceof THREE.RenderableParticle ) {

				_v1 = element;
				_v1.x *= _svgWidthHalf; _v1.y *= -_svgHeightHalf;

				renderParticle( _v1, element, material, scene );

			} else if ( element instanceof THREE.RenderableLine ) {

				_v1 = element.v1; _v2 = element.v2;

				_v1.positionScreen.x *= _svgWidthHalf; _v1.positionScreen.y *= - _svgHeightHalf;
				_v2.positionScreen.x *= _svgWidthHalf; _v2.positionScreen.y *= - _svgHeightHalf;

				_bboxRect.addPoint( _v1.positionScreen.x, _v1.positionScreen.y );
				_bboxRect.addPoint( _v2.positionScreen.x, _v2.positionScreen.y );

				if ( !_clipRect.intersects( _bboxRect ) ) {

					continue;

				}

				renderLine( _v1, _v2, element, material, scene );

			} else if ( element instanceof THREE.RenderableFace3 ) {

				_v1 = element.v1; _v2 = element.v2; _v3 = element.v3;

				_v1.positionScreen.x *= _svgWidthHalf; _v1.positionScreen.y *= - _svgHeightHalf;
				_v2.positionScreen.x *= _svgWidthHalf; _v2.positionScreen.y *= - _svgHeightHalf;
				_v3.positionScreen.x *= _svgWidthHalf; _v3.positionScreen.y *= - _svgHeightHalf;

				_bboxRect.addPoint( _v1.positionScreen.x, _v1.positionScreen.y );
				_bboxRect.addPoint( _v2.positionScreen.x, _v2.positionScreen.y );
				_bboxRect.addPoint( _v3.positionScreen.x, _v3.positionScreen.y );

				if ( !_clipRect.intersects( _bboxRect ) ) {

					continue;

				}

				renderFace3( _v1, _v2, _v3, element, material, scene );

			} else if ( element instanceof THREE.RenderableFace4 ) {

				_v1 = element.v1; _v2 = element.v2; _v3 = element.v3; _v4 = element.v4;

				_v1.positionScreen.x *= _svgWidthHalf; _v1.positionScreen.y *= -_svgHeightHalf;
				_v2.positionScreen.x *= _svgWidthHalf; _v2.positionScreen.y *= -_svgHeightHalf;
				_v3.positionScreen.x *= _svgWidthHalf; _v3.positionScreen.y *= -_svgHeightHalf;
				_v4.positionScreen.x *= _svgWidthHalf; _v4.positionScreen.y *= -_svgHeightHalf;

				_bboxRect.addPoint( _v1.positionScreen.x, _v1.positionScreen.y );
				_bboxRect.addPoint( _v2.positionScreen.x, _v2.positionScreen.y );
				_bboxRect.addPoint( _v3.positionScreen.x, _v3.positionScreen.y );
				_bboxRect.addPoint( _v4.positionScreen.x, _v4.positionScreen.y );

				if ( !_clipRect.intersects( _bboxRect) ) {

					continue;

				}

				renderFace4( _v1, _v2, _v3, _v4, element, material, scene );

			}

		}

	};

	function calculateLights( lights ) {

		var l, ll, light, lightColor;

		_ambientLight.setRGB( 0, 0, 0 );
		_directionalLights.setRGB( 0, 0, 0 );
		_pointLights.setRGB( 0, 0, 0 );

		for ( l = 0, ll = lights.length; l < ll; l++ ) {

			light = lights[ l ];
			lightColor = light.color;

			if ( light instanceof THREE.AmbientLight ) {

				_ambientLight.r += lightColor.r;
				_ambientLight.g += lightColor.g;
				_ambientLight.b += lightColor.b;

			} else if ( light instanceof THREE.DirectionalLight ) {

				_directionalLights.r += lightColor.r;
				_directionalLights.g += lightColor.g;
				_directionalLights.b += lightColor.b;

			} else if ( light instanceof THREE.PointLight ) {

				_pointLights.r += lightColor.r;
				_pointLights.g += lightColor.g;
				_pointLights.b += lightColor.b;

			}

		}

	}

	function calculateLight( lights, position, normal, color ) {

		var l, ll, light, lightColor, lightPosition, amount;

		for ( l = 0, ll = lights.length; l < ll; l ++ ) {

			light = lights[ l ];
			lightColor = light.color;

			if ( light instanceof THREE.DirectionalLight ) {

				lightPosition = light.matrixWorld.getPosition();

				amount = normal.dot( lightPosition );

				if ( amount <= 0 ) continue;

				amount *= light.intensity;

				color.r += lightColor.r * amount;
				color.g += lightColor.g * amount;
				color.b += lightColor.b * amount;

			} else if ( light instanceof THREE.PointLight ) {

				lightPosition = light.matrixWorld.getPosition();

				amount = normal.dot( _vector3.sub( lightPosition, position ).normalize() );

				if ( amount <= 0 ) continue;

				amount *= light.distance == 0 ? 1 : 1 - Math.min( position.distanceTo( lightPosition ) / light.distance, 1 );

				if ( amount == 0 ) continue;

				amount *= light.intensity;

				color.r += lightColor.r * amount;
				color.g += lightColor.g * amount;
				color.b += lightColor.b * amount;

			}

		}

	}

	function renderParticle( v1, element, material, scene ) {

		/*
		_svgNode = getCircleNode( _circleCount++ );
		_svgNode.setAttribute( 'cx', v1.x );
		_svgNode.setAttribute( 'cy', v1.y );
		_svgNode.setAttribute( 'r', element.scale.x * _svgWidthHalf );

		if ( material instanceof THREE.ParticleCircleMaterial ) {

			if ( _enableLighting ) {

				_color.r = _ambientLight.r + _directionalLights.r + _pointLights.r;
				_color.g = _ambientLight.g + _directionalLights.g + _pointLights.g;
				_color.b = _ambientLight.b + _directionalLights.b + _pointLights.b;

				_color.r = material.color.r * _color.r;
				_color.g = material.color.g * _color.g;
				_color.b = material.color.b * _color.b;

				_color.updateStyleString();

			} else {

				_color = material.color;

			}

			_svgNode.setAttribute( 'style', 'fill: ' + _color.__styleString );

		}

		_svg.appendChild( _svgNode );
		*/

	}

	function renderLine ( v1, v2, element, material, scene ) {

		_svgNode = getLineNode( _lineCount ++ );

		_svgNode.setAttribute( 'x1', v1.positionScreen.x );
		_svgNode.setAttribute( 'y1', v1.positionScreen.y );
		_svgNode.setAttribute( 'x2', v2.positionScreen.x );
		_svgNode.setAttribute( 'y2', v2.positionScreen.y );

		if ( material instanceof THREE.LineBasicMaterial ) {

			_svgNode.setAttribute( 'style', 'fill: none; stroke: ' + material.color.getContextStyle() + '; stroke-width: ' + material.linewidth + '; stroke-opacity: ' + material.opacity + '; stroke-linecap: ' + material.linecap + '; stroke-linejoin: ' + material.linejoin );

			_svg.appendChild( _svgNode );

		}

	}

	function renderFace3( v1, v2, v3, element, material, scene ) {

		_this.info.render.vertices += 3;
		_this.info.render.faces ++;

		_svgNode = getPathNode( _pathCount ++ );
		_svgNode.setAttribute( 'd', 'M ' + v1.positionScreen.x + ' ' + v1.positionScreen.y + ' L ' + v2.positionScreen.x + ' ' + v2.positionScreen.y + ' L ' + v3.positionScreen.x + ',' + v3.positionScreen.y + 'z' );

		if ( material instanceof THREE.MeshBasicMaterial ) {

			_color.copy( material.color );

		} else if ( material instanceof THREE.MeshLambertMaterial ) {

			if ( _enableLighting ) {

				_color.r = _ambientLight.r;
				_color.g = _ambientLight.g;
				_color.b = _ambientLight.b;

				calculateLight( _lights, element.centroidWorld, element.normalWorld, _color );

				_color.r = Math.max( 0, Math.min( material.color.r * _color.r, 1 ) );
				_color.g = Math.max( 0, Math.min( material.color.g * _color.g, 1 ) );
				_color.b = Math.max( 0, Math.min( material.color.b * _color.b, 1 ) );

			} else {

				_color.copy( material.color );

			}

		} else if ( material instanceof THREE.MeshDepthMaterial ) {

			_w = 1 - ( material.__2near / (material.__farPlusNear - element.z * material.__farMinusNear) );
			_color.setRGB( _w, _w, _w );

		} else if ( material instanceof THREE.MeshNormalMaterial ) {

			_color.setRGB( normalToComponent( element.normalWorld.x ), normalToComponent( element.normalWorld.y ), normalToComponent( element.normalWorld.z ) );

		}

		if ( material.wireframe ) {

			_svgNode.setAttribute( 'style', 'fill: none; stroke: ' + _color.getContextStyle() + '; stroke-width: ' + material.wireframeLinewidth + '; stroke-opacity: ' + material.opacity + '; stroke-linecap: ' + material.wireframeLinecap + '; stroke-linejoin: ' + material.wireframeLinejoin );

		} else {

			_svgNode.setAttribute( 'style', 'fill: ' + _color.getContextStyle() + '; fill-opacity: ' + material.opacity );

		}

		_svg.appendChild( _svgNode );

	}

	function renderFace4( v1, v2, v3, v4, element, material, scene ) {

		_this.info.render.vertices += 4;
		_this.info.render.faces ++;

		_svgNode = getPathNode( _pathCount ++ );
		_svgNode.setAttribute( 'd', 'M ' + v1.positionScreen.x + ' ' + v1.positionScreen.y + ' L ' + v2.positionScreen.x + ' ' + v2.positionScreen.y + ' L ' + v3.positionScreen.x + ',' + v3.positionScreen.y + ' L ' + v4.positionScreen.x + ',' + v4.positionScreen.y + 'z' );

		if ( material instanceof THREE.MeshBasicMaterial ) {

			_color.copy( material.color );

		} else if ( material instanceof THREE.MeshLambertMaterial ) {

			if ( _enableLighting ) {

				_color.r = _ambientLight.r;
				_color.g = _ambientLight.g;
				_color.b = _ambientLight.b;

				calculateLight( _lights, element.centroidWorld, element.normalWorld, _color );

				_color.r = Math.max( 0, Math.min( material.color.r * _color.r, 1 ) );
				_color.g = Math.max( 0, Math.min( material.color.g * _color.g, 1 ) );
				_color.b = Math.max( 0, Math.min( material.color.b * _color.b, 1 ) );

			} else {

				_color.copy( material.color );

			}

		} else if ( material instanceof THREE.MeshDepthMaterial ) {

			_w = 1 - ( material.__2near / (material.__farPlusNear - element.z * material.__farMinusNear) );
			_color.setRGB( _w, _w, _w );

		} else if ( material instanceof THREE.MeshNormalMaterial ) {

			_color.setRGB( normalToComponent( element.normalWorld.x ), normalToComponent( element.normalWorld.y ), normalToComponent( element.normalWorld.z ) );

		}

		if ( material.wireframe ) {

			_svgNode.setAttribute( 'style', 'fill: none; stroke: ' + _color.getContextStyle() + '; stroke-width: ' + material.wireframeLinewidth + '; stroke-opacity: ' + material.opacity + '; stroke-linecap: ' + material.wireframeLinecap + '; stroke-linejoin: ' + material.wireframeLinejoin );

		} else {

			_svgNode.setAttribute( 'style', 'fill: ' + _color.getContextStyle() + '; fill-opacity: ' + material.opacity );

		}

		_svg.appendChild( _svgNode );

	}

	function getLineNode( id ) {

		if ( _svgLinePool[ id ] == null ) {

			_svgLinePool[ id ] = document.createElementNS( 'http://www.w3.org/2000/svg', 'line' );

			if ( _quality == 0 ) {

				_svgLinePool[ id ].setAttribute( 'shape-rendering', 'crispEdges' ); //optimizeSpeed

			}

			return _svgLinePool[ id ];

		}

		return _svgLinePool[ id ];

	}

	function getPathNode( id ) {

		if ( _svgPathPool[ id ] == null ) {

			_svgPathPool[ id ] = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );

			if ( _quality == 0 ) {

				_svgPathPool[ id ].setAttribute( 'shape-rendering', 'crispEdges' ); //optimizeSpeed

			}

			return _svgPathPool[ id ];

		}

		return _svgPathPool[ id ];

	}

	function getCircleNode( id ) {

		if ( _svgCirclePool[id] == null ) {

			_svgCirclePool[ id ] = document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' );

			if ( _quality == 0 ) {

				_svgCirclePool[id].setAttribute( 'shape-rendering', 'crispEdges' ); //optimizeSpeed

			}

			return _svgCirclePool[ id ];

		}

		return _svgCirclePool[ id ];

	}

	function normalToComponent( normal ) {

		var component = ( normal + 1 ) * 0.5;
		return component < 0 ? 0 : ( component > 1 ? 1 : component );

	}

	function pad( str ) {

		while ( str.length < 6 ) str = '0' + str;
		return str;

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.RenderableVertex = function () {

	this.positionWorld = new THREE.Vector3();
	this.positionScreen = new THREE.Vector4();

	this.visible = true;

};

THREE.RenderableVertex.prototype.copy = function ( vertex ) {

	this.positionWorld.copy( vertex.positionWorld );
	this.positionScreen.copy( vertex.positionScreen );

}
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.RenderableFace3 = function () {

	this.v1 = new THREE.RenderableVertex();
	this.v2 = new THREE.RenderableVertex();
	this.v3 = new THREE.RenderableVertex();

	this.centroidWorld = new THREE.Vector3();
	this.centroidScreen = new THREE.Vector3();

	this.normalWorld = new THREE.Vector3();
	this.vertexNormalsWorld = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];

	this.material = null;
	this.faceMaterial = null;
	this.uvs = [[]];

	this.z = null;

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.RenderableFace4 = function () {

	this.v1 = new THREE.RenderableVertex();
	this.v2 = new THREE.RenderableVertex();
	this.v3 = new THREE.RenderableVertex();
	this.v4 = new THREE.RenderableVertex();

	this.centroidWorld = new THREE.Vector3();
	this.centroidScreen = new THREE.Vector3();

	this.normalWorld = new THREE.Vector3();
	this.vertexNormalsWorld = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];

	this.material = null;
	this.faceMaterial = null;
	this.uvs = [[]];

	this.z = null;

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.RenderableObject = function () {

	this.object = null;
	this.z = null;

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.RenderableParticle = function () {

	this.x = null;
	this.y = null;
	this.z = null;

	this.rotation = null;
	this.scale = new THREE.Vector2();

	this.material = null;

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.RenderableLine = function () {

	this.z = null;

	this.v1 = new THREE.RenderableVertex();
	this.v2 = new THREE.RenderableVertex();

	this.material = null;

};
=======
// ThreeSVG.js - http://github.com/mrdoob/three.js
'use strict';var THREE=THREE||{REVISION:"49dev"};self.Int32Array||(self.Int32Array=Array,self.Float32Array=Array);
(function(){for(var a=0,b=["ms","moz","webkit","o"],c=0;c<b.length&&!window.requestAnimationFrame;++c){window.requestAnimationFrame=window[b[c]+"RequestAnimationFrame"];window.cancelAnimationFrame=window[b[c]+"CancelAnimationFrame"]||window[b[c]+"CancelRequestAnimationFrame"]}if(!window.requestAnimationFrame)window.requestAnimationFrame=function(b){var c=Date.now(),f=Math.max(0,16-(c-a)),g=window.setTimeout(function(){b(c+f)},f);a=c+f;return g};if(!window.cancelAnimationFrame)window.cancelAnimationFrame=
function(a){clearTimeout(a)}})();THREE.Color=function(a){a!==void 0&&this.setHex(a);return this};
THREE.Color.prototype={constructor:THREE.Color,r:1,g:1,b:1,copy:function(a){this.r=a.r;this.g=a.g;this.b=a.b;return this},copyGammaToLinear:function(a){this.r=a.r*a.r;this.g=a.g*a.g;this.b=a.b*a.b;return this},copyLinearToGamma:function(a){this.r=Math.sqrt(a.r);this.g=Math.sqrt(a.g);this.b=Math.sqrt(a.b);return this},convertGammaToLinear:function(){var a=this.r,b=this.g,c=this.b;this.r=a*a;this.g=b*b;this.b=c*c;return this},convertLinearToGamma:function(){this.r=Math.sqrt(this.r);this.g=Math.sqrt(this.g);
this.b=Math.sqrt(this.b);return this},setRGB:function(a,b,c){this.r=a;this.g=b;this.b=c;return this},setHSV:function(a,b,c){var d,e,f;if(c===0)this.r=this.g=this.b=0;else{d=Math.floor(a*6);e=a*6-d;a=c*(1-b);f=c*(1-b*e);b=c*(1-b*(1-e));switch(d){case 1:this.r=f;this.g=c;this.b=a;break;case 2:this.r=a;this.g=c;this.b=b;break;case 3:this.r=a;this.g=f;this.b=c;break;case 4:this.r=b;this.g=a;this.b=c;break;case 5:this.r=c;this.g=a;this.b=f;break;case 6:case 0:this.r=c;this.g=b;this.b=a}}return this},setHex:function(a){a=
Math.floor(a);this.r=(a>>16&255)/255;this.g=(a>>8&255)/255;this.b=(a&255)/255;return this},lerpSelf:function(a,b){this.r=this.r+(a.r-this.r)*b;this.g=this.g+(a.g-this.g)*b;this.b=this.b+(a.b-this.b)*b;return this},getHex:function(){return Math.floor(this.r*255)<<16^Math.floor(this.g*255)<<8^Math.floor(this.b*255)},getContextStyle:function(){return"rgb("+Math.floor(this.r*255)+","+Math.floor(this.g*255)+","+Math.floor(this.b*255)+")"},clone:function(){return(new THREE.Color).setRGB(this.r,this.g,this.b)}};
THREE.Vector2=function(a,b){this.x=a||0;this.y=b||0};
THREE.Vector2.prototype={constructor:THREE.Vector2,set:function(a,b){this.x=a;this.y=b;return this},copy:function(a){this.x=a.x;this.y=a.y;return this},add:function(a,b){this.x=a.x+b.x;this.y=a.y+b.y;return this},addSelf:function(a){this.x=this.x+a.x;this.y=this.y+a.y;return this},sub:function(a,b){this.x=a.x-b.x;this.y=a.y-b.y;return this},subSelf:function(a){this.x=this.x-a.x;this.y=this.y-a.y;return this},multiplyScalar:function(a){this.x=this.x*a;this.y=this.y*a;return this},divideScalar:function(a){if(a){this.x=
this.x/a;this.y=this.y/a}else this.set(0,0);return this},negate:function(){return this.multiplyScalar(-1)},dot:function(a){return this.x*a.x+this.y*a.y},lengthSq:function(){return this.x*this.x+this.y*this.y},length:function(){return Math.sqrt(this.lengthSq())},normalize:function(){return this.divideScalar(this.length())},distanceTo:function(a){return Math.sqrt(this.distanceToSquared(a))},distanceToSquared:function(a){var b=this.x-a.x,a=this.y-a.y;return b*b+a*a},setLength:function(a){return this.normalize().multiplyScalar(a)},
lerpSelf:function(a,b){this.x=this.x+(a.x-this.x)*b;this.y=this.y+(a.y-this.y)*b;return this},equals:function(a){return a.x===this.x&&a.y===this.y},isZero:function(){return this.lengthSq()<1.0E-4},clone:function(){return new THREE.Vector2(this.x,this.y)}};THREE.Vector3=function(a,b,c){this.x=a||0;this.y=b||0;this.z=c||0};
THREE.Vector3.prototype={constructor:THREE.Vector3,set:function(a,b,c){this.x=a;this.y=b;this.z=c;return this},setX:function(a){this.x=a;return this},setY:function(a){this.y=a;return this},setZ:function(a){this.z=a;return this},copy:function(a){this.x=a.x;this.y=a.y;this.z=a.z;return this},add:function(a,b){this.x=a.x+b.x;this.y=a.y+b.y;this.z=a.z+b.z;return this},addSelf:function(a){this.x=this.x+a.x;this.y=this.y+a.y;this.z=this.z+a.z;return this},addScalar:function(a){this.x=this.x+a;this.y=this.y+
a;this.z=this.z+a;return this},sub:function(a,b){this.x=a.x-b.x;this.y=a.y-b.y;this.z=a.z-b.z;return this},subSelf:function(a){this.x=this.x-a.x;this.y=this.y-a.y;this.z=this.z-a.z;return this},multiply:function(a,b){this.x=a.x*b.x;this.y=a.y*b.y;this.z=a.z*b.z;return this},multiplySelf:function(a){this.x=this.x*a.x;this.y=this.y*a.y;this.z=this.z*a.z;return this},multiplyScalar:function(a){this.x=this.x*a;this.y=this.y*a;this.z=this.z*a;return this},divideSelf:function(a){this.x=this.x/a.x;this.y=
this.y/a.y;this.z=this.z/a.z;return this},divideScalar:function(a){if(a){this.x=this.x/a;this.y=this.y/a;this.z=this.z/a}else this.z=this.y=this.x=0;return this},negate:function(){return this.multiplyScalar(-1)},dot:function(a){return this.x*a.x+this.y*a.y+this.z*a.z},lengthSq:function(){return this.x*this.x+this.y*this.y+this.z*this.z},length:function(){return Math.sqrt(this.lengthSq())},lengthManhattan:function(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)},normalize:function(){return this.divideScalar(this.length())},
setLength:function(a){return this.normalize().multiplyScalar(a)},lerpSelf:function(a,b){this.x=this.x+(a.x-this.x)*b;this.y=this.y+(a.y-this.y)*b;this.z=this.z+(a.z-this.z)*b;return this},cross:function(a,b){this.x=a.y*b.z-a.z*b.y;this.y=a.z*b.x-a.x*b.z;this.z=a.x*b.y-a.y*b.x;return this},crossSelf:function(a){var b=this.x,c=this.y,d=this.z;this.x=c*a.z-d*a.y;this.y=d*a.x-b*a.z;this.z=b*a.y-c*a.x;return this},distanceTo:function(a){return Math.sqrt(this.distanceToSquared(a))},distanceToSquared:function(a){return(new THREE.Vector3).sub(this,
a).lengthSq()},getPositionFromMatrix:function(a){this.x=a.elements[12];this.y=a.elements[13];this.z=a.elements[14];return this},getRotationFromMatrix:function(a,b){var c=b?b.x:1,d=b?b.y:1,e=b?b.z:1,f=a.elements[0]/c,g=a.elements[4]/d,c=a.elements[1]/c,d=a.elements[5]/d,j=a.elements[9]/e,k=a.elements[10]/e;this.y=Math.asin(a.elements[8]/e);e=Math.cos(this.y);if(Math.abs(e)>1.0E-5){this.x=Math.atan2(-j/e,k/e);this.z=Math.atan2(-g/e,f/e)}else{this.x=0;this.z=Math.atan2(c,d)}return this},getScaleFromMatrix:function(a){var b=
this.set(a.elements[0],a.elements[1],a.elements[2]).length(),c=this.set(a.elements[4],a.elements[5],a.elements[6]).length(),a=this.set(a.elements[8],a.elements[9],a.elements[10]).length();this.x=b;this.y=c;this.z=a},equals:function(a){return a.x===this.x&&a.y===this.y&&a.z===this.z},isZero:function(){return this.lengthSq()<1.0E-4},clone:function(){return new THREE.Vector3(this.x,this.y,this.z)}};THREE.Vector4=function(a,b,c,d){this.x=a||0;this.y=b||0;this.z=c||0;this.w=d!==void 0?d:1};
THREE.Vector4.prototype={constructor:THREE.Vector4,set:function(a,b,c,d){this.x=a;this.y=b;this.z=c;this.w=d;return this},copy:function(a){this.x=a.x;this.y=a.y;this.z=a.z;this.w=a.w!==void 0?a.w:1;return this},add:function(a,b){this.x=a.x+b.x;this.y=a.y+b.y;this.z=a.z+b.z;this.w=a.w+b.w;return this},addSelf:function(a){this.x=this.x+a.x;this.y=this.y+a.y;this.z=this.z+a.z;this.w=this.w+a.w;return this},sub:function(a,b){this.x=a.x-b.x;this.y=a.y-b.y;this.z=a.z-b.z;this.w=a.w-b.w;return this},subSelf:function(a){this.x=
this.x-a.x;this.y=this.y-a.y;this.z=this.z-a.z;this.w=this.w-a.w;return this},multiplyScalar:function(a){this.x=this.x*a;this.y=this.y*a;this.z=this.z*a;this.w=this.w*a;return this},divideScalar:function(a){if(a){this.x=this.x/a;this.y=this.y/a;this.z=this.z/a;this.w=this.w/a}else{this.z=this.y=this.x=0;this.w=1}return this},negate:function(){return this.multiplyScalar(-1)},dot:function(a){return this.x*a.x+this.y*a.y+this.z*a.z+this.w*a.w},lengthSq:function(){return this.dot(this)},length:function(){return Math.sqrt(this.lengthSq())},
normalize:function(){return this.divideScalar(this.length())},setLength:function(a){return this.normalize().multiplyScalar(a)},lerpSelf:function(a,b){this.x=this.x+(a.x-this.x)*b;this.y=this.y+(a.y-this.y)*b;this.z=this.z+(a.z-this.z)*b;this.w=this.w+(a.w-this.w)*b;return this},clone:function(){return new THREE.Vector4(this.x,this.y,this.z,this.w)}};THREE.Frustum=function(){this.planes=[new THREE.Vector4,new THREE.Vector4,new THREE.Vector4,new THREE.Vector4,new THREE.Vector4,new THREE.Vector4]};
THREE.Frustum.prototype.setFromMatrix=function(a){var b,c=this.planes,d=a.elements,a=d[0];b=d[1];var e=d[2],f=d[3],g=d[4],j=d[5],k=d[6],i=d[7],h=d[8],n=d[9],m=d[10],o=d[11],q=d[12],l=d[13],s=d[14],d=d[15];c[0].set(f-a,i-g,o-h,d-q);c[1].set(f+a,i+g,o+h,d+q);c[2].set(f+b,i+j,o+n,d+l);c[3].set(f-b,i-j,o-n,d-l);c[4].set(f-e,i-k,o-m,d-s);c[5].set(f+e,i+k,o+m,d+s);for(a=0;a<6;a++){b=c[a];b.divideScalar(Math.sqrt(b.x*b.x+b.y*b.y+b.z*b.z))}};
THREE.Frustum.prototype.contains=function(a){for(var b=this.planes,c=a.matrixWorld,d=c.elements,c=-a.geometry.boundingSphere.radius*c.getMaxScaleOnAxis(),e=0;e<6;e++){a=b[e].x*d[12]+b[e].y*d[13]+b[e].z*d[14]+b[e].w;if(a<=c)return false}return true};THREE.Frustum.__v1=new THREE.Vector3;
THREE.Ray=function(a,b){function c(a,b,c){q.sub(c,a);w=q.dot(b);r=l.add(a,s.copy(b).multiplyScalar(w));return A=c.distanceTo(r)}function d(a,b,c,d){q.sub(d,b);l.sub(c,b);s.sub(a,b);u=q.dot(q);t=q.dot(l);B=q.dot(s);x=l.dot(l);D=l.dot(s);z=1/(u*x-t*t);C=(x*B-t*D)*z;F=(u*D-t*B)*z;return C>=0&&F>=0&&C+F<1}this.origin=a||new THREE.Vector3;this.direction=b||new THREE.Vector3;var e=1.0E-4;this.setPrecision=function(a){e=a};var f=new THREE.Vector3,g=new THREE.Vector3,j=new THREE.Vector3,k=new THREE.Vector3,
i=new THREE.Vector3,h=new THREE.Vector3,n=new THREE.Vector3,m=new THREE.Vector3,o=new THREE.Vector3;this.intersectObject=function(a){var b,l=[];if(a instanceof THREE.Particle){var q=c(this.origin,this.direction,a.matrixWorld.getPosition());if(q>a.scale.x)return[];b={distance:q,point:a.position,face:null,object:a};l.push(b)}else if(a instanceof THREE.Mesh){var q=c(this.origin,this.direction,a.matrixWorld.getPosition()),s=THREE.Frustum.__v1.set(a.matrixWorld.getColumnX().length(),a.matrixWorld.getColumnY().length(),
a.matrixWorld.getColumnZ().length());if(q>a.geometry.boundingSphere.radius*Math.max(s.x,Math.max(s.y,s.z)))return l;var r,t,u=a.geometry,y=u.vertices,p;a.matrixRotationWorld.extractRotation(a.matrixWorld);q=0;for(s=u.faces.length;q<s;q++){b=u.faces[q];i.copy(this.origin);h.copy(this.direction);p=a.matrixWorld;n=p.multiplyVector3(n.copy(b.centroid)).subSelf(i);m=a.matrixRotationWorld.multiplyVector3(m.copy(b.normal));r=h.dot(m);if(!(Math.abs(r)<e)){t=m.dot(n)/r;if(!(t<0)&&(a.doubleSided||(a.flipSided?
r>0:r<0))){o.add(i,h.multiplyScalar(t));if(b instanceof THREE.Face3){f=p.multiplyVector3(f.copy(y[b.a]));g=p.multiplyVector3(g.copy(y[b.b]));j=p.multiplyVector3(j.copy(y[b.c]));if(d(o,f,g,j)){b={distance:i.distanceTo(o),point:o.clone(),face:b,object:a};l.push(b)}}else if(b instanceof THREE.Face4){f=p.multiplyVector3(f.copy(y[b.a]));g=p.multiplyVector3(g.copy(y[b.b]));j=p.multiplyVector3(j.copy(y[b.c]));k=p.multiplyVector3(k.copy(y[b.d]));if(d(o,f,g,k)||d(o,g,j,k)){b={distance:i.distanceTo(o),point:o.clone(),
face:b,object:a};l.push(b)}}}}}}return l};this.intersectObjects=function(a){for(var b=[],c=0,d=a.length;c<d;c++)Array.prototype.push.apply(b,this.intersectObject(a[c]));b.sort(function(a,b){return a.distance-b.distance});return b};var q=new THREE.Vector3,l=new THREE.Vector3,s=new THREE.Vector3,w,r,A,u,t,B,x,D,z,C,F};
THREE.Rectangle=function(){function a(){f=d-b;g=e-c}var b,c,d,e,f,g,j=true;this.getX=function(){return b};this.getY=function(){return c};this.getWidth=function(){return f};this.getHeight=function(){return g};this.getLeft=function(){return b};this.getTop=function(){return c};this.getRight=function(){return d};this.getBottom=function(){return e};this.set=function(f,g,h,n){j=false;b=f;c=g;d=h;e=n;a()};this.addPoint=function(f,g){if(j){j=false;b=f;c=g;d=f;e=g}else{b=b<f?b:f;c=c<g?c:g;d=d>f?d:f;e=e>g?
e:g}a()};this.add3Points=function(f,g,h,n,m,o){if(j){j=false;b=f<h?f<m?f:m:h<m?h:m;c=g<n?g<o?g:o:n<o?n:o;d=f>h?f>m?f:m:h>m?h:m;e=g>n?g>o?g:o:n>o?n:o}else{b=f<h?f<m?f<b?f:b:m<b?m:b:h<m?h<b?h:b:m<b?m:b;c=g<n?g<o?g<c?g:c:o<c?o:c:n<o?n<c?n:c:o<c?o:c;d=f>h?f>m?f>d?f:d:m>d?m:d:h>m?h>d?h:d:m>d?m:d;e=g>n?g>o?g>e?g:e:o>e?o:e:n>o?n>e?n:e:o>e?o:e}a()};this.addRectangle=function(f){if(j){j=false;b=f.getLeft();c=f.getTop();d=f.getRight();e=f.getBottom()}else{b=b<f.getLeft()?b:f.getLeft();c=c<f.getTop()?c:f.getTop();
d=d>f.getRight()?d:f.getRight();e=e>f.getBottom()?e:f.getBottom()}a()};this.inflate=function(f){b=b-f;c=c-f;d=d+f;e=e+f;a()};this.minSelf=function(f){b=b>f.getLeft()?b:f.getLeft();c=c>f.getTop()?c:f.getTop();d=d<f.getRight()?d:f.getRight();e=e<f.getBottom()?e:f.getBottom();a()};this.intersects=function(a){return d<a.getLeft()||b>a.getRight()||e<a.getTop()||c>a.getBottom()?false:true};this.empty=function(){j=true;e=d=c=b=0;a()};this.isEmpty=function(){return j}};
THREE.Math={clamp:function(a,b,c){return a<b?b:a>c?c:a},clampBottom:function(a,b){return a<b?b:a},mapLinear:function(a,b,c,d,e){return d+(a-b)*(e-d)/(c-b)},random16:function(){return(65280*Math.random()+255*Math.random())/65535},randInt:function(a,b){return a+Math.floor(Math.random()*(b-a+1))},randFloat:function(a,b){return a+Math.random()*(b-a)},randFloatSpread:function(a){return a*(0.5-Math.random())},sign:function(a){return a<0?-1:a>0?1:0}};THREE.Matrix3=function(){this.elements=new Float32Array(9)};
THREE.Matrix3.prototype={constructor:THREE.Matrix3,getInverse:function(a){var b=a.elements,a=b[10]*b[5]-b[6]*b[9],c=-b[10]*b[1]+b[2]*b[9],d=b[6]*b[1]-b[2]*b[5],e=-b[10]*b[4]+b[6]*b[8],f=b[10]*b[0]-b[2]*b[8],g=-b[6]*b[0]+b[2]*b[4],j=b[9]*b[4]-b[5]*b[8],k=-b[9]*b[0]+b[1]*b[8],i=b[5]*b[0]-b[1]*b[4],b=b[0]*a+b[1]*e+b[2]*j;b===0&&console.warn("Matrix3.getInverse(): determinant == 0");var b=1/b,h=this.elements;h[0]=b*a;h[1]=b*c;h[2]=b*d;h[3]=b*e;h[4]=b*f;h[5]=b*g;h[6]=b*j;h[7]=b*k;h[8]=b*i;return this},
transpose:function(){var a,b=this.elements;a=b[1];b[1]=b[3];b[3]=a;a=b[2];b[2]=b[6];b[6]=a;a=b[5];b[5]=b[7];b[7]=a;return this},transposeIntoArray:function(a){var b=this.m;a[0]=b[0];a[1]=b[3];a[2]=b[6];a[3]=b[1];a[4]=b[4];a[5]=b[7];a[6]=b[2];a[7]=b[5];a[8]=b[8];return this}};THREE.Matrix4=function(a,b,c,d,e,f,g,j,k,i,h,n,m,o,q,l){this.elements=new Float32Array(16);this.set(a!==void 0?a:1,b||0,c||0,d||0,e||0,f!==void 0?f:1,g||0,j||0,k||0,i||0,h!==void 0?h:1,n||0,m||0,o||0,q||0,l!==void 0?l:1)};
THREE.Matrix4.prototype={constructor:THREE.Matrix4,set:function(a,b,c,d,e,f,g,j,k,i,h,n,m,o,q,l){var s=this.elements;s[0]=a;s[4]=b;s[8]=c;s[12]=d;s[1]=e;s[5]=f;s[9]=g;s[13]=j;s[2]=k;s[6]=i;s[10]=h;s[14]=n;s[3]=m;s[7]=o;s[11]=q;s[15]=l;return this},identity:function(){this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);return this},copy:function(a){a=a.elements;this.set(a[0],a[4],a[8],a[12],a[1],a[5],a[9],a[13],a[2],a[6],a[10],a[14],a[3],a[7],a[11],a[15]);return this},lookAt:function(a,b,c){var d=this.elements,
e=THREE.Matrix4.__v1,f=THREE.Matrix4.__v2,g=THREE.Matrix4.__v3;g.sub(a,b).normalize();if(g.length()===0)g.z=1;e.cross(c,g).normalize();if(e.length()===0){g.x=g.x+1.0E-4;e.cross(c,g).normalize()}f.cross(g,e);d[0]=e.x;d[4]=f.x;d[8]=g.x;d[1]=e.y;d[5]=f.y;d[9]=g.y;d[2]=e.z;d[6]=f.z;d[10]=g.z;return this},multiply:function(a,b){var c=a.elements,d=b.elements,e=this.elements,f=c[0],g=c[4],j=c[8],k=c[12],i=c[1],h=c[5],n=c[9],m=c[13],o=c[2],q=c[6],l=c[10],s=c[14],w=c[3],r=c[7],A=c[11],c=c[15],u=d[0],t=d[4],
B=d[8],x=d[12],D=d[1],z=d[5],C=d[9],F=d[13],E=d[2],L=d[6],H=d[10],v=d[14],I=d[3],J=d[7],K=d[11],d=d[15];e[0]=f*u+g*D+j*E+k*I;e[4]=f*t+g*z+j*L+k*J;e[8]=f*B+g*C+j*H+k*K;e[12]=f*x+g*F+j*v+k*d;e[1]=i*u+h*D+n*E+m*I;e[5]=i*t+h*z+n*L+m*J;e[9]=i*B+h*C+n*H+m*K;e[13]=i*x+h*F+n*v+m*d;e[2]=o*u+q*D+l*E+s*I;e[6]=o*t+q*z+l*L+s*J;e[10]=o*B+q*C+l*H+s*K;e[14]=o*x+q*F+l*v+s*d;e[3]=w*u+r*D+A*E+c*I;e[7]=w*t+r*z+A*L+c*J;e[11]=w*B+r*C+A*H+c*K;e[15]=w*x+r*F+A*v+c*d;return this},multiplySelf:function(a){return this.multiply(this,
a)},multiplyToArray:function(a,b,c){var d=this.elements;this.multiply(a,b);c[0]=d[0];c[1]=d[1];c[2]=d[2];c[3]=d[3];c[4]=d[4];c[5]=d[5];c[6]=d[6];c[7]=d[7];c[8]=d[8];c[9]=d[9];c[10]=d[10];c[11]=d[11];c[12]=d[12];c[13]=d[13];c[14]=d[14];c[15]=d[15];return this},multiplyScalar:function(a){var b=this.elements;b[0]=b[0]*a;b[4]=b[4]*a;b[8]=b[8]*a;b[12]=b[12]*a;b[1]=b[1]*a;b[5]=b[5]*a;b[9]=b[9]*a;b[13]=b[13]*a;b[2]=b[2]*a;b[6]=b[6]*a;b[10]=b[10]*a;b[14]=b[14]*a;b[3]=b[3]*a;b[7]=b[7]*a;b[11]=b[11]*a;b[15]=
b[15]*a;return this},multiplyVector3:function(a){var b=this.elements,c=a.x,d=a.y,e=a.z,f=1/(b[3]*c+b[7]*d+b[11]*e+b[15]);a.x=(b[0]*c+b[4]*d+b[8]*e+b[12])*f;a.y=(b[1]*c+b[5]*d+b[9]*e+b[13])*f;a.z=(b[2]*c+b[6]*d+b[10]*e+b[14])*f;return a},multiplyVector4:function(a){var b=this.elements,c=a.x,d=a.y,e=a.z,f=a.w;a.x=b[0]*c+b[4]*d+b[8]*e+b[12]*f;a.y=b[1]*c+b[5]*d+b[9]*e+b[13]*f;a.z=b[2]*c+b[6]*d+b[10]*e+b[14]*f;a.w=b[3]*c+b[7]*d+b[11]*e+b[15]*f;return a},rotateAxis:function(a){var b=this.elements,c=a.x,
d=a.y,e=a.z;a.x=c*b[0]+d*b[4]+e*b[8];a.y=c*b[1]+d*b[5]+e*b[9];a.z=c*b[2]+d*b[6]+e*b[10];a.normalize();return a},crossVector:function(a){var b=this.elements,c=new THREE.Vector4;c.x=b[0]*a.x+b[4]*a.y+b[8]*a.z+b[12]*a.w;c.y=b[1]*a.x+b[5]*a.y+b[9]*a.z+b[13]*a.w;c.z=b[2]*a.x+b[6]*a.y+b[10]*a.z+b[14]*a.w;c.w=a.w?b[3]*a.x+b[7]*a.y+b[11]*a.z+b[15]*a.w:1;return c},determinant:function(){var a=this.elements,b=a[0],c=a[4],d=a[8],e=a[12],f=a[1],g=a[5],j=a[9],k=a[13],i=a[2],h=a[6],n=a[10],m=a[14],o=a[3],q=a[7],
l=a[11],a=a[15];return e*j*h*o-d*k*h*o-e*g*n*o+c*k*n*o+d*g*m*o-c*j*m*o-e*j*i*q+d*k*i*q+e*f*n*q-b*k*n*q-d*f*m*q+b*j*m*q+e*g*i*l-c*k*i*l-e*f*h*l+b*k*h*l+c*f*m*l-b*g*m*l-d*g*i*a+c*j*i*a+d*f*h*a-b*j*h*a-c*f*n*a+b*g*n*a},transpose:function(){var a=this.elements,b;b=a[1];a[1]=a[4];a[4]=b;b=a[2];a[2]=a[8];a[8]=b;b=a[6];a[6]=a[9];a[9]=b;b=a[3];a[3]=a[12];a[12]=b;b=a[7];a[7]=a[13];a[13]=b;b=a[11];a[11]=a[14];a[14]=b;return this},flattenToArray:function(a){var b=this.elements;a[0]=b[0];a[1]=b[1];a[2]=b[2];
a[3]=b[3];a[4]=b[4];a[5]=b[5];a[6]=b[6];a[7]=b[7];a[8]=b[8];a[9]=b[9];a[10]=b[10];a[11]=b[11];a[12]=b[12];a[13]=b[13];a[14]=b[14];a[15]=b[15];return a},flattenToArrayOffset:function(a,b){var c=this.elements;a[b]=c[0];a[b+1]=c[1];a[b+2]=c[2];a[b+3]=c[3];a[b+4]=c[4];a[b+5]=c[5];a[b+6]=c[6];a[b+7]=c[7];a[b+8]=c[8];a[b+9]=c[9];a[b+10]=c[10];a[b+11]=c[11];a[b+12]=c[12];a[b+13]=c[13];a[b+14]=c[14];a[b+15]=c[15];return a},getPosition:function(){var a=this.elements;return THREE.Matrix4.__v1.set(a[12],a[13],
a[14])},setPosition:function(a){var b=this.elements;b[12]=a.x;b[13]=a.y;b[14]=a.z;return this},getColumnX:function(){var a=this.elements;return THREE.Matrix4.__v1.set(a[0],a[1],a[2])},getColumnY:function(){var a=this.elements;return THREE.Matrix4.__v1.set(a[4],a[5],a[6])},getColumnZ:function(){var a=this.elements;return THREE.Matrix4.__v1.set(a[8],a[9],a[10])},getInverse:function(a){var b=this.elements,c=a.elements,d=c[0],e=c[4],f=c[8],g=c[12],j=c[1],k=c[5],i=c[9],h=c[13],n=c[2],m=c[6],o=c[10],q=
c[14],l=c[3],s=c[7],w=c[11],c=c[15];b[0]=i*q*s-h*o*s+h*m*w-k*q*w-i*m*c+k*o*c;b[4]=g*o*s-f*q*s-g*m*w+e*q*w+f*m*c-e*o*c;b[8]=f*h*s-g*i*s+g*k*w-e*h*w-f*k*c+e*i*c;b[12]=g*i*m-f*h*m-g*k*o+e*h*o+f*k*q-e*i*q;b[1]=h*o*l-i*q*l-h*n*w+j*q*w+i*n*c-j*o*c;b[5]=f*q*l-g*o*l+g*n*w-d*q*w-f*n*c+d*o*c;b[9]=g*i*l-f*h*l-g*j*w+d*h*w+f*j*c-d*i*c;b[13]=f*h*n-g*i*n+g*j*o-d*h*o-f*j*q+d*i*q;b[2]=k*q*l-h*m*l+h*n*s-j*q*s-k*n*c+j*m*c;b[6]=g*m*l-e*q*l-g*n*s+d*q*s+e*n*c-d*m*c;b[10]=e*h*l-g*k*l+g*j*s-d*h*s-e*j*c+d*k*c;b[14]=g*k*n-
e*h*n-g*j*m+d*h*m+e*j*q-d*k*q;b[3]=i*m*l-k*o*l-i*n*s+j*o*s+k*n*w-j*m*w;b[7]=e*o*l-f*m*l+f*n*s-d*o*s-e*n*w+d*m*w;b[11]=f*k*l-e*i*l-f*j*s+d*i*s+e*j*w-d*k*w;b[15]=e*i*n-f*k*n+f*j*m-d*i*m-e*j*o+d*k*o;this.multiplyScalar(1/a.determinant());return this},setRotationFromEuler:function(a,b){var c=this.elements,d=a.x,e=a.y,f=a.z,g=Math.cos(d),d=Math.sin(d),j=Math.cos(e),e=Math.sin(e),k=Math.cos(f),f=Math.sin(f);switch(b){case "YXZ":var i=j*k,h=j*f,n=e*k,m=e*f;c[0]=i+m*d;c[4]=n*d-h;c[8]=g*e;c[1]=g*f;c[5]=g*
k;c[9]=-d;c[2]=h*d-n;c[6]=m+i*d;c[10]=g*j;break;case "ZXY":i=j*k;h=j*f;n=e*k;m=e*f;c[0]=i-m*d;c[4]=-g*f;c[8]=n+h*d;c[1]=h+n*d;c[5]=g*k;c[9]=m-i*d;c[2]=-g*e;c[6]=d;c[10]=g*j;break;case "ZYX":i=g*k;h=g*f;n=d*k;m=d*f;c[0]=j*k;c[4]=n*e-h;c[8]=i*e+m;c[1]=j*f;c[5]=m*e+i;c[9]=h*e-n;c[2]=-e;c[6]=d*j;c[10]=g*j;break;case "YZX":i=g*j;h=g*e;n=d*j;m=d*e;c[0]=j*k;c[4]=m-i*f;c[8]=n*f+h;c[1]=f;c[5]=g*k;c[9]=-d*k;c[2]=-e*k;c[6]=h*f+n;c[10]=i-m*f;break;case "XZY":i=g*j;h=g*e;n=d*j;m=d*e;c[0]=j*k;c[4]=-f;c[8]=e*k;
c[1]=i*f+m;c[5]=g*k;c[9]=h*f-n;c[2]=n*f-h;c[6]=d*k;c[10]=m*f+i;break;default:i=g*k;h=g*f;n=d*k;m=d*f;c[0]=j*k;c[4]=-j*f;c[8]=e;c[1]=h+n*e;c[5]=i-m*e;c[9]=-d*j;c[2]=m-i*e;c[6]=n+h*e;c[10]=g*j}return this},setRotationFromQuaternion:function(a){var b=this.elements,c=a.x,d=a.y,e=a.z,f=a.w,g=c+c,j=d+d,k=e+e,a=c*g,i=c*j,c=c*k,h=d*j,d=d*k,e=e*k,g=f*g,j=f*j,f=f*k;b[0]=1-(h+e);b[4]=i-f;b[8]=c+j;b[1]=i+f;b[5]=1-(a+e);b[9]=d-g;b[2]=c-j;b[6]=d+g;b[10]=1-(a+h);return this},compose:function(a,b,c){var d=this.elements,
e=THREE.Matrix4.__m1,f=THREE.Matrix4.__m2;e.identity();e.setRotationFromQuaternion(b);f.makeScale(c.x,c.y,c.z);this.multiply(e,f);d[12]=a.x;d[13]=a.y;d[14]=a.z;return this},decompose:function(a,b,c){var d=this.elements,e=THREE.Matrix4.__v1,f=THREE.Matrix4.__v2,g=THREE.Matrix4.__v3;e.set(d[0],d[1],d[2]);f.set(d[4],d[5],d[6]);g.set(d[8],d[9],d[10]);a=a instanceof THREE.Vector3?a:new THREE.Vector3;b=b instanceof THREE.Quaternion?b:new THREE.Quaternion;c=c instanceof THREE.Vector3?c:new THREE.Vector3;
c.x=e.length();c.y=f.length();c.z=g.length();a.x=d[12];a.y=d[13];a.z=d[14];d=THREE.Matrix4.__m1;d.copy(this);d.elements[0]=d.elements[0]/c.x;d.elements[1]=d.elements[1]/c.x;d.elements[2]=d.elements[2]/c.x;d.elements[4]=d.elements[4]/c.y;d.elements[5]=d.elements[5]/c.y;d.elements[6]=d.elements[6]/c.y;d.elements[8]=d.elements[8]/c.z;d.elements[9]=d.elements[9]/c.z;d.elements[10]=d.elements[10]/c.z;b.setFromRotationMatrix(d);return[a,b,c]},extractPosition:function(a){var b=this.elements,a=a.elements;
b[12]=a[12];b[13]=a[13];b[14]=a[14];return this},extractRotation:function(a){var b=this.elements,a=a.elements,c=THREE.Matrix4.__v1,d=1/c.set(a[0],a[1],a[2]).length(),e=1/c.set(a[4],a[5],a[6]).length(),c=1/c.set(a[8],a[9],a[10]).length();b[0]=a[0]*d;b[1]=a[1]*d;b[2]=a[2]*d;b[4]=a[4]*e;b[5]=a[5]*e;b[6]=a[6]*e;b[8]=a[8]*c;b[9]=a[9]*c;b[10]=a[10]*c;return this},translate:function(a){var b=this.elements,c=a.x,d=a.y,a=a.z;b[12]=b[0]*c+b[4]*d+b[8]*a+b[12];b[13]=b[1]*c+b[5]*d+b[9]*a+b[13];b[14]=b[2]*c+b[6]*
d+b[10]*a+b[14];b[15]=b[3]*c+b[7]*d+b[11]*a+b[15];return this},rotateX:function(a){var b=this.elements,c=b[4],d=b[5],e=b[6],f=b[7],g=b[8],j=b[9],k=b[10],i=b[11],h=Math.cos(a),a=Math.sin(a);b[4]=h*c+a*g;b[5]=h*d+a*j;b[6]=h*e+a*k;b[7]=h*f+a*i;b[8]=h*g-a*c;b[9]=h*j-a*d;b[10]=h*k-a*e;b[11]=h*i-a*f;return this},rotateY:function(a){var b=this.elements,c=b[0],d=b[1],e=b[2],f=b[3],g=b[8],j=b[9],k=b[10],i=b[11],h=Math.cos(a),a=Math.sin(a);b[0]=h*c-a*g;b[1]=h*d-a*j;b[2]=h*e-a*k;b[3]=h*f-a*i;b[8]=h*g+a*c;b[9]=
h*j+a*d;b[10]=h*k+a*e;b[11]=h*i+a*f;return this},rotateZ:function(a){var b=this.elements,c=b[0],d=b[1],e=b[2],f=b[3],g=b[4],j=b[5],k=b[6],i=b[7],h=Math.cos(a),a=Math.sin(a);b[0]=h*c+a*g;b[1]=h*d+a*j;b[2]=h*e+a*k;b[3]=h*f+a*i;b[4]=h*g-a*c;b[5]=h*j-a*d;b[6]=h*k-a*e;b[7]=h*i-a*f;return this},rotateByAxis:function(a,b){var c=this.elements;if(a.x===1&&a.y===0&&a.z===0)return this.rotateX(b);if(a.x===0&&a.y===1&&a.z===0)return this.rotateY(b);if(a.x===0&&a.y===0&&a.z===1)return this.rotateZ(b);var d=a.x,
e=a.y,f=a.z,g=Math.sqrt(d*d+e*e+f*f),d=d/g,e=e/g,f=f/g,g=d*d,j=e*e,k=f*f,i=Math.cos(b),h=Math.sin(b),n=1-i,m=d*e*n,o=d*f*n,n=e*f*n,d=d*h,q=e*h,h=f*h,f=g+(1-g)*i,g=m+h,e=o-q,m=m-h,j=j+(1-j)*i,h=n+d,o=o+q,n=n-d,k=k+(1-k)*i,i=c[0],d=c[1],q=c[2],l=c[3],s=c[4],w=c[5],r=c[6],A=c[7],u=c[8],t=c[9],B=c[10],x=c[11];c[0]=f*i+g*s+e*u;c[1]=f*d+g*w+e*t;c[2]=f*q+g*r+e*B;c[3]=f*l+g*A+e*x;c[4]=m*i+j*s+h*u;c[5]=m*d+j*w+h*t;c[6]=m*q+j*r+h*B;c[7]=m*l+j*A+h*x;c[8]=o*i+n*s+k*u;c[9]=o*d+n*w+k*t;c[10]=o*q+n*r+k*B;c[11]=
o*l+n*A+k*x;return this},scale:function(a){var b=this.elements,c=a.x,d=a.y,a=a.z;b[0]=b[0]*c;b[4]=b[4]*d;b[8]=b[8]*a;b[1]=b[1]*c;b[5]=b[5]*d;b[9]=b[9]*a;b[2]=b[2]*c;b[6]=b[6]*d;b[10]=b[10]*a;b[3]=b[3]*c;b[7]=b[7]*d;b[11]=b[11]*a;return this},getMaxScaleOnAxis:function(){var a=this.elements;return Math.sqrt(Math.max(a[0]*a[0]+a[1]*a[1]+a[2]*a[2],Math.max(a[4]*a[4]+a[5]*a[5]+a[6]*a[6],a[8]*a[8]+a[9]*a[9]+a[10]*a[10])))},makeTranslation:function(a,b,c){this.set(1,0,0,a,0,1,0,b,0,0,1,c,0,0,0,1);return this},
makeRotationX:function(a){var b=Math.cos(a),a=Math.sin(a);this.set(1,0,0,0,0,b,-a,0,0,a,b,0,0,0,0,1);return this},makeRotationY:function(a){var b=Math.cos(a),a=Math.sin(a);this.set(b,0,a,0,0,1,0,0,-a,0,b,0,0,0,0,1);return this},makeRotationZ:function(a){var b=Math.cos(a),a=Math.sin(a);this.set(b,-a,0,0,a,b,0,0,0,0,1,0,0,0,0,1);return this},makeRotationAxis:function(a,b){var c=Math.cos(b),d=Math.sin(b),e=1-c,f=a.x,g=a.y,j=a.z,k=e*f,i=e*g;this.set(k*f+c,k*g-d*j,k*j+d*g,0,k*g+d*j,i*g+c,i*j-d*f,0,k*j-
d*g,i*j+d*f,e*j*j+c,0,0,0,0,1);return this},makeScale:function(a,b,c){this.set(a,0,0,0,0,b,0,0,0,0,c,0,0,0,0,1);return this},makeFrustum:function(a,b,c,d,e,f){var g=this.elements;g[0]=2*e/(b-a);g[4]=0;g[8]=(b+a)/(b-a);g[12]=0;g[1]=0;g[5]=2*e/(d-c);g[9]=(d+c)/(d-c);g[13]=0;g[2]=0;g[6]=0;g[10]=-(f+e)/(f-e);g[14]=-2*f*e/(f-e);g[3]=0;g[7]=0;g[11]=-1;g[15]=0;return this},makePerspective:function(a,b,c,d){var a=c*Math.tan(a*Math.PI/360),e=-a;return this.makeFrustum(e*b,a*b,e,a,c,d)},makeOrthographic:function(a,
b,c,d,e,f){var g=this.elements,j=b-a,k=c-d,i=f-e;g[0]=2/j;g[4]=0;g[8]=0;g[12]=-((b+a)/j);g[1]=0;g[5]=2/k;g[9]=0;g[13]=-((c+d)/k);g[2]=0;g[6]=0;g[10]=-2/i;g[14]=-((f+e)/i);g[3]=0;g[7]=0;g[11]=0;g[15]=1;return this},clone:function(){var a=this.elements;return new THREE.Matrix4(a[0],a[4],a[8],a[12],a[1],a[5],a[9],a[13],a[2],a[6],a[10],a[14],a[3],a[7],a[11],a[15])}};THREE.Matrix4.__v1=new THREE.Vector3;THREE.Matrix4.__v2=new THREE.Vector3;THREE.Matrix4.__v3=new THREE.Vector3;THREE.Matrix4.__m1=new THREE.Matrix4;
THREE.Matrix4.__m2=new THREE.Matrix4;
THREE.Object3D=function(){this.id=THREE.Object3DCount++;this.name="";this.parent=void 0;this.children=[];this.up=new THREE.Vector3(0,1,0);this.position=new THREE.Vector3;this.rotation=new THREE.Vector3;this.eulerOrder="XYZ";this.scale=new THREE.Vector3(1,1,1);this.flipSided=this.doubleSided=false;this.renderDepth=null;this.rotationAutoUpdate=true;this.matrix=new THREE.Matrix4;this.matrixWorld=new THREE.Matrix4;this.matrixRotationWorld=new THREE.Matrix4;this.matrixWorldNeedsUpdate=this.matrixAutoUpdate=
true;this.quaternion=new THREE.Quaternion;this.useQuaternion=false;this.boundRadius=0;this.boundRadiusScale=1;this.visible=true;this.receiveShadow=this.castShadow=false;this.frustumCulled=true;this._vector=new THREE.Vector3};
THREE.Object3D.prototype={constructor:THREE.Object3D,applyMatrix:function(a){this.matrix.multiply(a,this.matrix);this.scale.getScaleFromMatrix(this.matrix);this.rotation.getRotationFromMatrix(this.matrix,this.scale);this.position.getPositionFromMatrix(this.matrix)},translate:function(a,b){this.matrix.rotateAxis(b);this.position.addSelf(b.multiplyScalar(a))},translateX:function(a){this.translate(a,this._vector.set(1,0,0))},translateY:function(a){this.translate(a,this._vector.set(0,1,0))},translateZ:function(a){this.translate(a,
this._vector.set(0,0,1))},lookAt:function(a){this.matrix.lookAt(a,this.position,this.up);this.rotationAutoUpdate&&this.rotation.getRotationFromMatrix(this.matrix)},add:function(a){if(a===this)console.warn("THREE.Object3D.add: An object can't be added as a child of itself.");else if(a instanceof THREE.Object3D){a.parent!==void 0&&a.parent.remove(a);a.parent=this;this.children.push(a);for(var b=this;b.parent!==void 0;)b=b.parent;b!==void 0&&b instanceof THREE.Scene&&b.__addObject(a)}},remove:function(a){var b=
this.children.indexOf(a);if(b!==-1){a.parent=void 0;this.children.splice(b,1);for(b=this;b.parent!==void 0;)b=b.parent;b!==void 0&&b instanceof THREE.Scene&&b.__removeObject(a)}},getChildByName:function(a,b){var c,d,e;c=0;for(d=this.children.length;c<d;c++){e=this.children[c];if(e.name===a)return e;if(b){e=e.getChildByName(a,b);if(e!==void 0)return e}}},updateMatrix:function(){this.matrix.setPosition(this.position);this.useQuaternion?this.matrix.setRotationFromQuaternion(this.quaternion):this.matrix.setRotationFromEuler(this.rotation,
this.eulerOrder);if(this.scale.x!==1||this.scale.y!==1||this.scale.z!==1){this.matrix.scale(this.scale);this.boundRadiusScale=Math.max(this.scale.x,Math.max(this.scale.y,this.scale.z))}this.matrixWorldNeedsUpdate=true},updateMatrixWorld:function(a){this.matrixAutoUpdate&&this.updateMatrix();if(this.matrixWorldNeedsUpdate||a){this.parent?this.matrixWorld.multiply(this.parent.matrixWorld,this.matrix):this.matrixWorld.copy(this.matrix);this.matrixWorldNeedsUpdate=false;a=true}for(var b=0,c=this.children.length;b<
c;b++)this.children[b].updateMatrixWorld(a)}};THREE.Object3DCount=0;
THREE.Projector=function(){function a(){var a=g[f]=g[f]||new THREE.RenderableObject;f++;return a}function b(){var a=i[k]=i[k]||new THREE.RenderableVertex;k++;return a}function c(a,b){return b.z-a.z}function d(a,b){var c=0,d=1,f=a.z+a.w,e=b.z+b.w,g=-a.z+a.w,h=-b.z+b.w;if(f>=0&&e>=0&&g>=0&&h>=0)return true;if(f<0&&e<0||g<0&&h<0)return false;f<0?c=Math.max(c,f/(f-e)):e<0&&(d=Math.min(d,f/(f-e)));g<0?c=Math.max(c,g/(g-h)):h<0&&(d=Math.min(d,g/(g-h)));if(d<c)return false;a.lerpSelf(b,c);b.lerpSelf(a,1-
d);return true}var e,f,g=[],j,k,i=[],h,n,m=[],o,q=[],l,s,w=[],r,A,u=[],t={objects:[],sprites:[],lights:[],elements:[]},B=new THREE.Vector3,x=new THREE.Vector4,D=new THREE.Matrix4,z=new THREE.Matrix4,C=new THREE.Frustum,F=new THREE.Vector4,E=new THREE.Vector4;this.projectVector=function(a,b){b.matrixWorldInverse.getInverse(b.matrixWorld);D.multiply(b.projectionMatrix,b.matrixWorldInverse);D.multiplyVector3(a);return a};this.unprojectVector=function(a,b){b.projectionMatrixInverse.getInverse(b.projectionMatrix);
D.multiply(b.matrixWorld,b.projectionMatrixInverse);D.multiplyVector3(a);return a};this.pickingRay=function(a,b){var c;a.z=-1;c=new THREE.Vector3(a.x,a.y,1);this.unprojectVector(a,b);this.unprojectVector(c,b);c.subSelf(a).normalize();return new THREE.Ray(a,c)};this.projectGraph=function(b,d){f=0;t.objects.length=0;t.sprites.length=0;t.lights.length=0;var g=function(b){if(b.visible!==false){if((b instanceof THREE.Mesh||b instanceof THREE.Line)&&(b.frustumCulled===false||C.contains(b))){B.copy(b.matrixWorld.getPosition());
D.multiplyVector3(B);e=a();e.object=b;e.z=B.z;t.objects.push(e)}else if(b instanceof THREE.Sprite||b instanceof THREE.Particle){B.copy(b.matrixWorld.getPosition());D.multiplyVector3(B);e=a();e.object=b;e.z=B.z;t.sprites.push(e)}else b instanceof THREE.Light&&t.lights.push(b);for(var c=0,d=b.children.length;c<d;c++)g(b.children[c])}};g(b);d&&t.objects.sort(c);return t};this.projectScene=function(a,f,e){var g=f.near,B=f.far,K=false,R,y,p,P,G,N,O,Q,M,S,T,V,W,X,U;A=s=o=n=0;t.elements.length=0;if(f.parent===
void 0){console.warn("DEPRECATED: Camera hasn't been added to a Scene. Adding it...");a.add(f)}a.updateMatrixWorld();f.matrixWorldInverse.getInverse(f.matrixWorld);D.multiply(f.projectionMatrix,f.matrixWorldInverse);C.setFromMatrix(D);t=this.projectGraph(a,false);a=0;for(R=t.objects.length;a<R;a++){M=t.objects[a].object;S=M.matrixWorld;k=0;if(M instanceof THREE.Mesh){T=M.geometry;V=M.geometry.materials;P=T.vertices;W=T.faces;X=T.faceVertexUvs;T=M.matrixRotationWorld.extractRotation(S);y=0;for(p=P.length;y<
p;y++){j=b();j.positionWorld.copy(P[y]);S.multiplyVector3(j.positionWorld);j.positionScreen.copy(j.positionWorld);D.multiplyVector4(j.positionScreen);j.positionScreen.x=j.positionScreen.x/j.positionScreen.w;j.positionScreen.y=j.positionScreen.y/j.positionScreen.w;j.visible=j.positionScreen.z>g&&j.positionScreen.z<B}P=0;for(y=W.length;P<y;P++){p=W[P];if(p instanceof THREE.Face3){G=i[p.a];N=i[p.b];O=i[p.c];if(G.visible&&N.visible&&O.visible){K=(O.positionScreen.x-G.positionScreen.x)*(N.positionScreen.y-
G.positionScreen.y)-(O.positionScreen.y-G.positionScreen.y)*(N.positionScreen.x-G.positionScreen.x)<0;if(M.doubleSided||K!=M.flipSided){Q=m[n]=m[n]||new THREE.RenderableFace3;n++;h=Q;h.v1.copy(G);h.v2.copy(N);h.v3.copy(O)}else continue}else continue}else if(p instanceof THREE.Face4){G=i[p.a];N=i[p.b];O=i[p.c];Q=i[p.d];if(G.visible&&N.visible&&O.visible&&Q.visible){K=(Q.positionScreen.x-G.positionScreen.x)*(N.positionScreen.y-G.positionScreen.y)-(Q.positionScreen.y-G.positionScreen.y)*(N.positionScreen.x-
G.positionScreen.x)<0||(N.positionScreen.x-O.positionScreen.x)*(Q.positionScreen.y-O.positionScreen.y)-(N.positionScreen.y-O.positionScreen.y)*(Q.positionScreen.x-O.positionScreen.x)<0;if(M.doubleSided||K!=M.flipSided){U=q[o]=q[o]||new THREE.RenderableFace4;o++;h=U;h.v1.copy(G);h.v2.copy(N);h.v3.copy(O);h.v4.copy(Q)}else continue}else continue}h.normalWorld.copy(p.normal);!K&&(M.flipSided||M.doubleSided)&&h.normalWorld.negate();T.multiplyVector3(h.normalWorld);h.centroidWorld.copy(p.centroid);S.multiplyVector3(h.centroidWorld);
h.centroidScreen.copy(h.centroidWorld);D.multiplyVector3(h.centroidScreen);O=p.vertexNormals;G=0;for(N=O.length;G<N;G++){Q=h.vertexNormalsWorld[G];Q.copy(O[G]);!K&&(M.flipSided||M.doubleSided)&&Q.negate();T.multiplyVector3(Q)}G=0;for(N=X.length;G<N;G++)if(U=X[G][P]){O=0;for(Q=U.length;O<Q;O++)h.uvs[G][O]=U[O]}h.material=M.material;h.faceMaterial=p.materialIndex!==null?V[p.materialIndex]:null;h.z=h.centroidScreen.z;t.elements.push(h)}}else if(M instanceof THREE.Line){z.multiply(D,S);P=M.geometry.vertices;
G=b();G.positionScreen.copy(P[0]);z.multiplyVector4(G.positionScreen);S=M.type===THREE.LinePieces?2:1;y=1;for(p=P.length;y<p;y++){G=b();G.positionScreen.copy(P[y]);z.multiplyVector4(G.positionScreen);if(!((y+1)%S>0)){N=i[k-2];F.copy(G.positionScreen);E.copy(N.positionScreen);if(d(F,E)){F.multiplyScalar(1/F.w);E.multiplyScalar(1/E.w);V=w[s]=w[s]||new THREE.RenderableLine;s++;l=V;l.v1.positionScreen.copy(F);l.v2.positionScreen.copy(E);l.z=Math.max(F.z,E.z);l.material=M.material;t.elements.push(l)}}}}}a=
0;for(R=t.sprites.length;a<R;a++){M=t.sprites[a].object;S=M.matrixWorld;if(M instanceof THREE.Particle){x.set(S.elements[12],S.elements[13],S.elements[14],1);D.multiplyVector4(x);x.z=x.z/x.w;if(x.z>0&&x.z<1){g=u[A]=u[A]||new THREE.RenderableParticle;A++;r=g;r.x=x.x/x.w;r.y=x.y/x.w;r.z=x.z;r.rotation=M.rotation.z;r.scale.x=M.scale.x*Math.abs(r.x-(x.x+f.projectionMatrix.elements[0])/(x.w+f.projectionMatrix.elements[12]));r.scale.y=M.scale.y*Math.abs(r.y-(x.y+f.projectionMatrix.elements[5])/(x.w+f.projectionMatrix.elements[13]));
r.material=M.material;t.elements.push(r)}}}e&&t.elements.sort(c);return t}};THREE.Quaternion=function(a,b,c,d){this.x=a||0;this.y=b||0;this.z=c||0;this.w=d!==void 0?d:1};
THREE.Quaternion.prototype={constructor:THREE.Quaternion,set:function(a,b,c,d){this.x=a;this.y=b;this.z=c;this.w=d;return this},copy:function(a){this.x=a.x;this.y=a.y;this.z=a.z;this.w=a.w;return this},setFromEuler:function(a){var b=Math.PI/360,c=a.x*b,d=a.y*b,e=a.z*b,a=Math.cos(d),d=Math.sin(d),b=Math.cos(-e),e=Math.sin(-e),f=Math.cos(c),c=Math.sin(c),g=a*b,j=d*e;this.w=g*f-j*c;this.x=g*c+j*f;this.y=d*b*f+a*e*c;this.z=a*e*f-d*b*c;return this},setFromAxisAngle:function(a,b){var c=b/2,d=Math.sin(c);
this.x=a.x*d;this.y=a.y*d;this.z=a.z*d;this.w=Math.cos(c);return this},setFromRotationMatrix:function(a){var b=Math.pow(a.determinant(),1/3);this.w=Math.sqrt(Math.max(0,b+a.elements[0]+a.elements[5]+a.elements[10]))/2;this.x=Math.sqrt(Math.max(0,b+a.elements[0]-a.elements[5]-a.elements[10]))/2;this.y=Math.sqrt(Math.max(0,b-a.elements[0]+a.elements[5]-a.elements[10]))/2;this.z=Math.sqrt(Math.max(0,b-a.elements[0]-a.elements[5]+a.elements[10]))/2;this.x=a.elements[6]-a.elements[9]<0?-Math.abs(this.x):
Math.abs(this.x);this.y=a.elements[8]-a.elements[2]<0?-Math.abs(this.y):Math.abs(this.y);this.z=a.elements[1]-a.elements[4]<0?-Math.abs(this.z):Math.abs(this.z);this.normalize();return this},calculateW:function(){this.w=-Math.sqrt(Math.abs(1-this.x*this.x-this.y*this.y-this.z*this.z));return this},inverse:function(){this.x=this.x*-1;this.y=this.y*-1;this.z=this.z*-1;return this},length:function(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)},normalize:function(){var a=
Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w);if(a===0)this.w=this.z=this.y=this.x=0;else{a=1/a;this.x=this.x*a;this.y=this.y*a;this.z=this.z*a;this.w=this.w*a}return this},multiply:function(a,b){this.x=a.x*b.w+a.y*b.z-a.z*b.y+a.w*b.x;this.y=-a.x*b.z+a.y*b.w+a.z*b.x+a.w*b.y;this.z=a.x*b.y-a.y*b.x+a.z*b.w+a.w*b.z;this.w=-a.x*b.x-a.y*b.y-a.z*b.z+a.w*b.w;return this},multiplySelf:function(a){var b=this.x,c=this.y,d=this.z,e=this.w,f=a.x,g=a.y,j=a.z,a=a.w;this.x=b*a+e*f+c*j-d*g;this.y=
c*a+e*g+d*f-b*j;this.z=d*a+e*j+b*g-c*f;this.w=e*a-b*f-c*g-d*j;return this},multiplyVector3:function(a,b){b||(b=a);var c=a.x,d=a.y,e=a.z,f=this.x,g=this.y,j=this.z,k=this.w,i=k*c+g*e-j*d,h=k*d+j*c-f*e,n=k*e+f*d-g*c,c=-f*c-g*d-j*e;b.x=i*k+c*-f+h*-j-n*-g;b.y=h*k+c*-g+n*-f-i*-j;b.z=n*k+c*-j+i*-g-h*-f;return b},clone:function(){return new THREE.Quaternion(this.x,this.y,this.z,this.w)}};
THREE.Quaternion.slerp=function(a,b,c,d){var e=a.w*b.w+a.x*b.x+a.y*b.y+a.z*b.z;if(e<0){c.w=-b.w;c.x=-b.x;c.y=-b.y;c.z=-b.z;e=-e}else c.copy(b);if(Math.abs(e)>=1){c.w=a.w;c.x=a.x;c.y=a.y;c.z=a.z;return c}var f=Math.acos(e),e=Math.sqrt(1-e*e);if(Math.abs(e)<0.001){c.w=0.5*(a.w+b.w);c.x=0.5*(a.x+b.x);c.y=0.5*(a.y+b.y);c.z=0.5*(a.z+b.z);return c}b=Math.sin((1-d)*f)/e;d=Math.sin(d*f)/e;c.w=a.w*b+c.w*d;c.x=a.x*b+c.x*d;c.y=a.y*b+c.y*d;c.z=a.z*b+c.z*d;return c};THREE.Vertex=function(){console.warn("THREE.Vertex has been DEPRECATED. Use THREE.Vector3 instead.")};
THREE.Face3=function(a,b,c,d,e,f){this.a=a;this.b=b;this.c=c;this.normal=d instanceof THREE.Vector3?d:new THREE.Vector3;this.vertexNormals=d instanceof Array?d:[];this.color=e instanceof THREE.Color?e:new THREE.Color;this.vertexColors=e instanceof Array?e:[];this.vertexTangents=[];this.materialIndex=f;this.centroid=new THREE.Vector3};
THREE.Face3.prototype={constructor:THREE.Face3,clone:function(){var a=new THREE.Face3(this.a,this.b,this.c);a.normal.copy(this.normal);a.color.copy(this.color);a.centroid.copy(this.centroid);a.materialIndex=this.materialIndex;var b,c;b=0;for(c=this.vertexNormals.length;b<c;b++)a.vertexNormals[b]=this.vertexNormals[b].clone();b=0;for(c=this.vertexColors.length;b<c;b++)a.vertexColors[b]=this.vertexColors[b].clone();b=0;for(c=this.vertexTangents.length;b<c;b++)a.vertexTangents[b]=this.vertexTangents[b].clone();
return a}};THREE.Face4=function(a,b,c,d,e,f,g){this.a=a;this.b=b;this.c=c;this.d=d;this.normal=e instanceof THREE.Vector3?e:new THREE.Vector3;this.vertexNormals=e instanceof Array?e:[];this.color=f instanceof THREE.Color?f:new THREE.Color;this.vertexColors=f instanceof Array?f:[];this.vertexTangents=[];this.materialIndex=g;this.centroid=new THREE.Vector3};
THREE.Face4.prototype={constructor:THREE.Face4,clone:function(){var a=new THREE.Face4(this.a,this.b,this.c,this.d);a.normal.copy(this.normal);a.color.copy(this.color);a.centroid.copy(this.centroid);a.materialIndex=this.materialIndex;var b,c;b=0;for(c=this.vertexNormals.length;b<c;b++)a.vertexNormals[b]=this.vertexNormals[b].clone();b=0;for(c=this.vertexColors.length;b<c;b++)a.vertexColors[b]=this.vertexColors[b].clone();b=0;for(c=this.vertexTangents.length;b<c;b++)a.vertexTangents[b]=this.vertexTangents[b].clone();
return a}};THREE.UV=function(a,b){this.u=a||0;this.v=b||0};THREE.UV.prototype={constructor:THREE.UV,set:function(a,b){this.u=a;this.v=b;return this},copy:function(a){this.u=a.u;this.v=a.v;return this},lerpSelf:function(a,b){this.u=this.u+(a.u-this.u)*b;this.v=this.v+(a.v-this.v)*b;return this},clone:function(){return new THREE.UV(this.u,this.v)}};
THREE.Geometry=function(){this.id=THREE.GeometryCount++;this.vertices=[];this.colors=[];this.materials=[];this.faces=[];this.faceUvs=[[]];this.faceVertexUvs=[[]];this.morphTargets=[];this.morphColors=[];this.morphNormals=[];this.skinWeights=[];this.skinIndices=[];this.boundingSphere=this.boundingBox=null;this.dynamic=this.hasTangents=false};
THREE.Geometry.prototype={constructor:THREE.Geometry,applyMatrix:function(a){var b=new THREE.Matrix4;b.extractRotation(a);for(var c=0,d=this.vertices.length;c<d;c++)a.multiplyVector3(this.vertices[c]);c=0;for(d=this.faces.length;c<d;c++){var e=this.faces[c];b.multiplyVector3(e.normal);for(var f=0,g=e.vertexNormals.length;f<g;f++)b.multiplyVector3(e.vertexNormals[f]);a.multiplyVector3(e.centroid)}},computeCentroids:function(){var a,b,c;a=0;for(b=this.faces.length;a<b;a++){c=this.faces[a];c.centroid.set(0,
0,0);if(c instanceof THREE.Face3){c.centroid.addSelf(this.vertices[c.a]);c.centroid.addSelf(this.vertices[c.b]);c.centroid.addSelf(this.vertices[c.c]);c.centroid.divideScalar(3)}else if(c instanceof THREE.Face4){c.centroid.addSelf(this.vertices[c.a]);c.centroid.addSelf(this.vertices[c.b]);c.centroid.addSelf(this.vertices[c.c]);c.centroid.addSelf(this.vertices[c.d]);c.centroid.divideScalar(4)}}},computeFaceNormals:function(){var a,b,c,d,e,f,g=new THREE.Vector3,j=new THREE.Vector3;a=0;for(b=this.faces.length;a<
b;a++){c=this.faces[a];d=this.vertices[c.a];e=this.vertices[c.b];f=this.vertices[c.c];g.sub(f,e);j.sub(d,e);g.crossSelf(j);g.isZero()||g.normalize();c.normal.copy(g)}},computeVertexNormals:function(){var a,b,c,d;if(this.__tmpVertices===void 0){d=this.__tmpVertices=Array(this.vertices.length);a=0;for(b=this.vertices.length;a<b;a++)d[a]=new THREE.Vector3;a=0;for(b=this.faces.length;a<b;a++){c=this.faces[a];if(c instanceof THREE.Face3)c.vertexNormals=[new THREE.Vector3,new THREE.Vector3,new THREE.Vector3];
else if(c instanceof THREE.Face4)c.vertexNormals=[new THREE.Vector3,new THREE.Vector3,new THREE.Vector3,new THREE.Vector3]}}else{d=this.__tmpVertices;a=0;for(b=this.vertices.length;a<b;a++)d[a].set(0,0,0)}a=0;for(b=this.faces.length;a<b;a++){c=this.faces[a];if(c instanceof THREE.Face3){d[c.a].addSelf(c.normal);d[c.b].addSelf(c.normal);d[c.c].addSelf(c.normal)}else if(c instanceof THREE.Face4){d[c.a].addSelf(c.normal);d[c.b].addSelf(c.normal);d[c.c].addSelf(c.normal);d[c.d].addSelf(c.normal)}}a=0;
for(b=this.vertices.length;a<b;a++)d[a].normalize();a=0;for(b=this.faces.length;a<b;a++){c=this.faces[a];if(c instanceof THREE.Face3){c.vertexNormals[0].copy(d[c.a]);c.vertexNormals[1].copy(d[c.b]);c.vertexNormals[2].copy(d[c.c])}else if(c instanceof THREE.Face4){c.vertexNormals[0].copy(d[c.a]);c.vertexNormals[1].copy(d[c.b]);c.vertexNormals[2].copy(d[c.c]);c.vertexNormals[3].copy(d[c.d])}}},computeMorphNormals:function(){var a,b,c,d,e;c=0;for(d=this.faces.length;c<d;c++){e=this.faces[c];e.__originalFaceNormal?
e.__originalFaceNormal.copy(e.normal):e.__originalFaceNormal=e.normal.clone();if(!e.__originalVertexNormals)e.__originalVertexNormals=[];a=0;for(b=e.vertexNormals.length;a<b;a++)e.__originalVertexNormals[a]?e.__originalVertexNormals[a].copy(e.vertexNormals[a]):e.__originalVertexNormals[a]=e.vertexNormals[a].clone()}var f=new THREE.Geometry;f.faces=this.faces;a=0;for(b=this.morphTargets.length;a<b;a++){if(!this.morphNormals[a]){this.morphNormals[a]={};this.morphNormals[a].faceNormals=[];this.morphNormals[a].vertexNormals=
[];var g=this.morphNormals[a].faceNormals,j=this.morphNormals[a].vertexNormals,k,i;c=0;for(d=this.faces.length;c<d;c++){e=this.faces[c];k=new THREE.Vector3;i=e instanceof THREE.Face3?{a:new THREE.Vector3,b:new THREE.Vector3,c:new THREE.Vector3}:{a:new THREE.Vector3,b:new THREE.Vector3,c:new THREE.Vector3,d:new THREE.Vector3};g.push(k);j.push(i)}}g=this.morphNormals[a];f.vertices=this.morphTargets[a].vertices;f.computeFaceNormals();f.computeVertexNormals();c=0;for(d=this.faces.length;c<d;c++){e=this.faces[c];
k=g.faceNormals[c];i=g.vertexNormals[c];k.copy(e.normal);if(e instanceof THREE.Face3){i.a.copy(e.vertexNormals[0]);i.b.copy(e.vertexNormals[1]);i.c.copy(e.vertexNormals[2])}else{i.a.copy(e.vertexNormals[0]);i.b.copy(e.vertexNormals[1]);i.c.copy(e.vertexNormals[2]);i.d.copy(e.vertexNormals[3])}}}c=0;for(d=this.faces.length;c<d;c++){e=this.faces[c];e.normal=e.__originalFaceNormal;e.vertexNormals=e.__originalVertexNormals}},computeTangents:function(){function a(a,b,c,d,f,e,G){j=a.vertices[b];k=a.vertices[c];
i=a.vertices[d];h=g[f];n=g[e];m=g[G];o=k.x-j.x;q=i.x-j.x;l=k.y-j.y;s=i.y-j.y;w=k.z-j.z;r=i.z-j.z;A=n.u-h.u;u=m.u-h.u;t=n.v-h.v;B=m.v-h.v;x=1/(A*B-u*t);F.set((B*o-t*q)*x,(B*l-t*s)*x,(B*w-t*r)*x);E.set((A*q-u*o)*x,(A*s-u*l)*x,(A*r-u*w)*x);z[b].addSelf(F);z[c].addSelf(F);z[d].addSelf(F);C[b].addSelf(E);C[c].addSelf(E);C[d].addSelf(E)}var b,c,d,e,f,g,j,k,i,h,n,m,o,q,l,s,w,r,A,u,t,B,x,D,z=[],C=[],F=new THREE.Vector3,E=new THREE.Vector3,L=new THREE.Vector3,H=new THREE.Vector3,v=new THREE.Vector3;b=0;for(c=
this.vertices.length;b<c;b++){z[b]=new THREE.Vector3;C[b]=new THREE.Vector3}b=0;for(c=this.faces.length;b<c;b++){f=this.faces[b];g=this.faceVertexUvs[0][b];if(f instanceof THREE.Face3)a(this,f.a,f.b,f.c,0,1,2);else if(f instanceof THREE.Face4){a(this,f.a,f.b,f.d,0,1,3);a(this,f.b,f.c,f.d,1,2,3)}}var I=["a","b","c","d"];b=0;for(c=this.faces.length;b<c;b++){f=this.faces[b];for(d=0;d<f.vertexNormals.length;d++){v.copy(f.vertexNormals[d]);e=f[I[d]];D=z[e];L.copy(D);L.subSelf(v.multiplyScalar(v.dot(D))).normalize();
H.cross(f.vertexNormals[d],D);e=H.dot(C[e]);e=e<0?-1:1;f.vertexTangents[d]=new THREE.Vector4(L.x,L.y,L.z,e)}}this.hasTangents=true},computeBoundingBox:function(){if(!this.boundingBox)this.boundingBox={min:new THREE.Vector3,max:new THREE.Vector3};if(this.vertices.length>0){var a;a=this.vertices[0];this.boundingBox.min.copy(a);this.boundingBox.max.copy(a);for(var b=this.boundingBox.min,c=this.boundingBox.max,d=1,e=this.vertices.length;d<e;d++){a=this.vertices[d];if(a.x<b.x)b.x=a.x;else if(a.x>c.x)c.x=
a.x;if(a.y<b.y)b.y=a.y;else if(a.y>c.y)c.y=a.y;if(a.z<b.z)b.z=a.z;else if(a.z>c.z)c.z=a.z}}else{this.boundingBox.min.set(0,0,0);this.boundingBox.max.set(0,0,0)}},computeBoundingSphere:function(){if(!this.boundingSphere)this.boundingSphere={radius:0};for(var a,b=0,c=0,d=this.vertices.length;c<d;c++){a=this.vertices[c].length();a>b&&(b=a)}this.boundingSphere.radius=b},mergeVertices:function(){var a={},b=[],c=[],d,e=Math.pow(10,4),f,g,j;f=0;for(g=this.vertices.length;f<g;f++){d=this.vertices[f];d=[Math.round(d.x*
e),Math.round(d.y*e),Math.round(d.z*e)].join("_");if(a[d]===void 0){a[d]=f;b.push(this.vertices[f]);c[f]=b.length-1}else c[f]=c[a[d]]}f=0;for(g=this.faces.length;f<g;f++){e=this.faces[f];if(e instanceof THREE.Face3){e.a=c[e.a];e.b=c[e.b];e.c=c[e.c]}else if(e instanceof THREE.Face4){e.a=c[e.a];e.b=c[e.b];e.c=c[e.c];e.d=c[e.d];d=[e.a,e.b,e.c,e.d];for(a=3;a>0;a--)if(d.indexOf(e["abcd"[a]])!=a){d.splice(a,1);this.faces[f]=new THREE.Face3(d[0],d[1],d[2]);e=0;for(d=this.faceVertexUvs.length;e<d;e++)(j=
this.faceVertexUvs[e][f])&&j.splice(a,1);break}}}c=this.vertices.length-b.length;this.vertices=b;return c}};THREE.GeometryCount=0;THREE.Camera=function(){THREE.Object3D.call(this);this.matrixWorldInverse=new THREE.Matrix4;this.projectionMatrix=new THREE.Matrix4;this.projectionMatrixInverse=new THREE.Matrix4};THREE.Camera.prototype=new THREE.Object3D;THREE.Camera.prototype.constructor=THREE.Camera;
THREE.Camera.prototype.lookAt=function(a){this.matrix.lookAt(this.position,a,this.up);this.rotationAutoUpdate&&this.rotation.getRotationFromMatrix(this.matrix)};THREE.OrthographicCamera=function(a,b,c,d,e,f){THREE.Camera.call(this);this.left=a;this.right=b;this.top=c;this.bottom=d;this.near=e!==void 0?e:0.1;this.far=f!==void 0?f:2E3;this.updateProjectionMatrix()};THREE.OrthographicCamera.prototype=new THREE.Camera;THREE.OrthographicCamera.prototype.constructor=THREE.OrthographicCamera;
THREE.OrthographicCamera.prototype.updateProjectionMatrix=function(){this.projectionMatrix.makeOrthographic(this.left,this.right,this.top,this.bottom,this.near,this.far)};THREE.PerspectiveCamera=function(a,b,c,d){THREE.Camera.call(this);this.fov=a!==void 0?a:50;this.aspect=b!==void 0?b:1;this.near=c!==void 0?c:0.1;this.far=d!==void 0?d:2E3;this.updateProjectionMatrix()};THREE.PerspectiveCamera.prototype=new THREE.Camera;THREE.PerspectiveCamera.prototype.constructor=THREE.PerspectiveCamera;
THREE.PerspectiveCamera.prototype.setLens=function(a,b){this.fov=2*Math.atan((b!==void 0?b:24)/(a*2))*(180/Math.PI);this.updateProjectionMatrix()};THREE.PerspectiveCamera.prototype.setViewOffset=function(a,b,c,d,e,f){this.fullWidth=a;this.fullHeight=b;this.x=c;this.y=d;this.width=e;this.height=f;this.updateProjectionMatrix()};
THREE.PerspectiveCamera.prototype.updateProjectionMatrix=function(){if(this.fullWidth){var a=this.fullWidth/this.fullHeight,b=Math.tan(this.fov*Math.PI/360)*this.near,c=-b,d=a*c,a=Math.abs(a*b-d),c=Math.abs(b-c);this.projectionMatrix.makeFrustum(d+this.x*a/this.fullWidth,d+(this.x+this.width)*a/this.fullWidth,b-(this.y+this.height)*c/this.fullHeight,b-this.y*c/this.fullHeight,this.near,this.far)}else this.projectionMatrix.makePerspective(this.fov,this.aspect,this.near,this.far)};
THREE.Light=function(a){THREE.Object3D.call(this);this.color=new THREE.Color(a)};THREE.Light.prototype=new THREE.Object3D;THREE.Light.prototype.constructor=THREE.Light;THREE.Light.prototype.supr=THREE.Object3D.prototype;THREE.AmbientLight=function(a){THREE.Light.call(this,a)};THREE.AmbientLight.prototype=new THREE.Light;THREE.AmbientLight.prototype.constructor=THREE.AmbientLight;
THREE.DirectionalLight=function(a,b,c){THREE.Light.call(this,a);this.position=new THREE.Vector3(0,1,0);this.target=new THREE.Object3D;this.intensity=b!==void 0?b:1;this.distance=c!==void 0?c:0;this.onlyShadow=this.castShadow=false;this.shadowCameraNear=50;this.shadowCameraFar=5E3;this.shadowCameraLeft=-500;this.shadowCameraTop=this.shadowCameraRight=500;this.shadowCameraBottom=-500;this.shadowCameraVisible=false;this.shadowBias=0;this.shadowDarkness=0.5;this.shadowMapHeight=this.shadowMapWidth=512;
this.shadowCascade=false;this.shadowCascadeOffset=new THREE.Vector3(0,0,-1E3);this.shadowCascadeCount=2;this.shadowCascadeBias=[0,0,0];this.shadowCascadeWidth=[512,512,512];this.shadowCascadeHeight=[512,512,512];this.shadowCascadeNearZ=[-1,0.99,0.998];this.shadowCascadeFarZ=[0.99,0.998,1];this.shadowCascadeArray=[];this.shadowMatrix=this.shadowCamera=this.shadowMapSize=this.shadowMap=null};THREE.DirectionalLight.prototype=new THREE.Light;THREE.DirectionalLight.prototype.constructor=THREE.DirectionalLight;
THREE.PointLight=function(a,b,c){THREE.Light.call(this,a);this.position=new THREE.Vector3(0,0,0);this.intensity=b!==void 0?b:1;this.distance=c!==void 0?c:0};THREE.PointLight.prototype=new THREE.Light;THREE.PointLight.prototype.constructor=THREE.PointLight;THREE.Loader=function(a){this.statusDomElement=(this.showStatus=a)?THREE.Loader.prototype.addStatusElement():null;this.onLoadStart=function(){};this.onLoadProgress=function(){};this.onLoadComplete=function(){}};
THREE.Loader.prototype={constructor:THREE.Loader,crossOrigin:"anonymous",addStatusElement:function(){var a=document.createElement("div");a.style.position="absolute";a.style.right="0px";a.style.top="0px";a.style.fontSize="0.8em";a.style.textAlign="left";a.style.background="rgba(0,0,0,0.25)";a.style.color="#fff";a.style.width="120px";a.style.padding="0.5em 0.5em 0.5em 0.5em";a.style.zIndex=1E3;a.innerHTML="Loading ...";return a},updateProgress:function(a){var b="Loaded ",b=a.total?b+((100*a.loaded/
a.total).toFixed(0)+"%"):b+((a.loaded/1E3).toFixed(2)+" KB");this.statusDomElement.innerHTML=b},extractUrlBase:function(a){a=a.split("/");a.pop();return(a.length<1?".":a.join("/"))+"/"},initMaterials:function(a,b,c){a.materials=[];for(var d=0;d<b.length;++d)a.materials[d]=THREE.Loader.prototype.createMaterial(b[d],c)},hasNormals:function(a){var b,c,d=a.materials.length;for(c=0;c<d;c++){b=a.materials[c];if(b instanceof THREE.ShaderMaterial)return true}return false},createMaterial:function(a,b){function c(a){a=
Math.log(a)/Math.LN2;return Math.floor(a)==a}function d(a){a=Math.log(a)/Math.LN2;return Math.pow(2,Math.round(a))}function e(a,b){var f=new Image;f.onload=function(){if(!c(this.width)||!c(this.height)){var b=d(this.width),f=d(this.height);a.image.width=b;a.image.height=f;a.image.getContext("2d").drawImage(this,0,0,b,f)}else a.image=this;a.needsUpdate=true};f.crossOrigin=j.crossOrigin;f.src=b}function f(a,c,d,f,g,h){var j=document.createElement("canvas");a[c]=new THREE.Texture(j);a[c].sourceFile=
d;if(f){a[c].repeat.set(f[0],f[1]);if(f[0]!=1)a[c].wrapS=THREE.RepeatWrapping;if(f[1]!=1)a[c].wrapT=THREE.RepeatWrapping}g&&a[c].offset.set(g[0],g[1]);if(h){f={repeat:THREE.RepeatWrapping,mirror:THREE.MirroredRepeatWrapping};if(f[h[0]]!==void 0)a[c].wrapS=f[h[0]];if(f[h[1]]!==void 0)a[c].wrapT=f[h[1]]}e(a[c],b+"/"+d)}function g(a){return(a[0]*255<<16)+(a[1]*255<<8)+a[2]*255}var j=this,k="MeshLambertMaterial",i={color:15658734,opacity:1,map:null,lightMap:null,normalMap:null,wireframe:a.wireframe};
if(a.shading){var h=a.shading.toLowerCase();h==="phong"?k="MeshPhongMaterial":h==="basic"&&(k="MeshBasicMaterial")}if(a.blending!==void 0&&THREE[a.blending]!==void 0)i.blending=THREE[a.blending];if(a.transparent!==void 0||a.opacity<1)i.transparent=a.transparent;if(a.depthTest!==void 0)i.depthTest=a.depthTest;if(a.depthWrite!==void 0)i.depthWrite=a.depthWrite;if(a.vertexColors!==void 0)if(a.vertexColors=="face")i.vertexColors=THREE.FaceColors;else if(a.vertexColors)i.vertexColors=THREE.VertexColors;
if(a.colorDiffuse)i.color=g(a.colorDiffuse);else if(a.DbgColor)i.color=a.DbgColor;if(a.colorSpecular)i.specular=g(a.colorSpecular);if(a.colorAmbient)i.ambient=g(a.colorAmbient);if(a.transparency)i.opacity=a.transparency;if(a.specularCoef)i.shininess=a.specularCoef;a.mapDiffuse&&b&&f(i,"map",a.mapDiffuse,a.mapDiffuseRepeat,a.mapDiffuseOffset,a.mapDiffuseWrap);a.mapLight&&b&&f(i,"lightMap",a.mapLight,a.mapLightRepeat,a.mapLightOffset,a.mapLightWrap);a.mapNormal&&b&&f(i,"normalMap",a.mapNormal,a.mapNormalRepeat,
a.mapNormalOffset,a.mapNormalWrap);a.mapSpecular&&b&&f(i,"specularMap",a.mapSpecular,a.mapSpecularRepeat,a.mapSpecularOffset,a.mapSpecularWrap);if(a.mapNormal){k=THREE.ShaderUtils.lib.normal;h=THREE.UniformsUtils.clone(k.uniforms);h.tNormal.texture=i.normalMap;if(a.mapNormalFactor)h.uNormalScale.value=a.mapNormalFactor;if(i.map){h.tDiffuse.texture=i.map;h.enableDiffuse.value=true}if(i.specularMap){h.tSpecular.texture=i.specularMap;h.enableSpecular.value=true}if(i.lightMap){h.tAO.texture=i.lightMap;
h.enableAO.value=true}h.uDiffuseColor.value.setHex(i.color);h.uSpecularColor.value.setHex(i.specular);h.uAmbientColor.value.setHex(i.ambient);h.uShininess.value=i.shininess;if(i.opacity!==void 0)h.uOpacity.value=i.opacity;i=new THREE.ShaderMaterial({fragmentShader:k.fragmentShader,vertexShader:k.vertexShader,uniforms:h,lights:true,fog:true})}else i=new THREE[k](i);if(a.DbgName!==void 0)i.name=a.DbgName;return i}};THREE.BinaryLoader=function(a){THREE.Loader.call(this,a)};
THREE.BinaryLoader.prototype=new THREE.Loader;THREE.BinaryLoader.prototype.constructor=THREE.BinaryLoader;THREE.BinaryLoader.prototype.load=function(a,b,c,d){var c=c?c:this.extractUrlBase(a),d=d?d:this.extractUrlBase(a),e=this.showProgress?THREE.Loader.prototype.updateProgress:null;this.onLoadStart();this.loadAjaxJSON(this,a,b,c,d,e)};
THREE.BinaryLoader.prototype.loadAjaxJSON=function(a,b,c,d,e,f){var g=new XMLHttpRequest;g.onreadystatechange=function(){if(g.readyState==4)if(g.status==200||g.status==0){var j=JSON.parse(g.responseText);a.loadAjaxBuffers(j,c,e,d,f)}else console.error("THREE.BinaryLoader: Couldn't load ["+b+"] ["+g.status+"]")};g.open("GET",b,true);g.overrideMimeType&&g.overrideMimeType("text/plain; charset=x-user-defined");g.setRequestHeader("Content-Type","text/plain");g.send(null)};
THREE.BinaryLoader.prototype.loadAjaxBuffers=function(a,b,c,d,e){var f=new XMLHttpRequest,g=c+"/"+a.buffers,j=0;f.onreadystatechange=function(){if(f.readyState==4)f.status==200||f.status==0?THREE.BinaryLoader.prototype.createBinModel(f.response,b,d,a.materials):console.error("THREE.BinaryLoader: Couldn't load ["+g+"] ["+f.status+"]");else if(f.readyState==3){if(e){j==0&&(j=f.getResponseHeader("Content-Length"));e({total:j,loaded:f.responseText.length})}}else f.readyState==2&&(j=f.getResponseHeader("Content-Length"))};
f.open("GET",g,true);f.responseType="arraybuffer";f.send(null)};
THREE.BinaryLoader.prototype.createBinModel=function(a,b,c,d){var e=function(b){var c,e,k,i,h,n,m,o,q,l,s,w,r,A,u;function t(a){return a%4?4-a%4:0}function B(a,b){return(new Uint8Array(a,b,1))[0]}function x(a,b){return(new Uint32Array(a,b,1))[0]}function D(b,c){var d,f,e,g,h,j,i,k,l=new Uint32Array(a,c,3*b);for(d=0;d<b;d++){f=l[d*3];e=l[d*3+1];g=l[d*3+2];h=J[f*2];f=J[f*2+1];j=J[e*2];i=J[e*2+1];e=J[g*2];k=J[g*2+1];g=H.faceVertexUvs[0];var m=[];m.push(new THREE.UV(h,f));m.push(new THREE.UV(j,i));m.push(new THREE.UV(e,
k));g.push(m)}}function z(b,c){var d,f,e,g,h,j,i,k,l,m,n=new Uint32Array(a,c,4*b);for(d=0;d<b;d++){f=n[d*4];e=n[d*4+1];g=n[d*4+2];h=n[d*4+3];j=J[f*2];f=J[f*2+1];i=J[e*2];l=J[e*2+1];k=J[g*2];m=J[g*2+1];g=J[h*2];e=J[h*2+1];h=H.faceVertexUvs[0];var o=[];o.push(new THREE.UV(j,f));o.push(new THREE.UV(i,l));o.push(new THREE.UV(k,m));o.push(new THREE.UV(g,e));h.push(o)}}function C(b,c,d){for(var f,e,g,h,c=new Uint32Array(a,c,3*b),j=new Uint16Array(a,d,b),d=0;d<b;d++){f=c[d*3];e=c[d*3+1];g=c[d*3+2];h=j[d];
H.faces.push(new THREE.Face3(f,e,g,null,null,h))}}function F(b,c,d){for(var f,e,g,h,j,c=new Uint32Array(a,c,4*b),i=new Uint16Array(a,d,b),d=0;d<b;d++){f=c[d*4];e=c[d*4+1];g=c[d*4+2];h=c[d*4+3];j=i[d];H.faces.push(new THREE.Face4(f,e,g,h,null,null,j))}}function E(b,c,d,f){for(var e,g,h,j,i,k,l,c=new Uint32Array(a,c,3*b),d=new Uint32Array(a,d,3*b),m=new Uint16Array(a,f,b),f=0;f<b;f++){e=c[f*3];g=c[f*3+1];h=c[f*3+2];i=d[f*3];k=d[f*3+1];l=d[f*3+2];j=m[f];var n=I[k*3],o=I[k*3+1];k=I[k*3+2];var q=I[l*3],
r=I[l*3+1];l=I[l*3+2];H.faces.push(new THREE.Face3(e,g,h,[new THREE.Vector3(I[i*3],I[i*3+1],I[i*3+2]),new THREE.Vector3(n,o,k),new THREE.Vector3(q,r,l)],null,j))}}function L(b,c,d,f){for(var e,g,h,j,i,k,l,m,n,c=new Uint32Array(a,c,4*b),d=new Uint32Array(a,d,4*b),o=new Uint16Array(a,f,b),f=0;f<b;f++){e=c[f*4];g=c[f*4+1];h=c[f*4+2];j=c[f*4+3];k=d[f*4];l=d[f*4+1];m=d[f*4+2];n=d[f*4+3];i=o[f];var q=I[l*3],r=I[l*3+1];l=I[l*3+2];var s=I[m*3],t=I[m*3+1];m=I[m*3+2];var u=I[n*3],v=I[n*3+1];n=I[n*3+2];H.faces.push(new THREE.Face4(e,
g,h,j,[new THREE.Vector3(I[k*3],I[k*3+1],I[k*3+2]),new THREE.Vector3(q,r,l),new THREE.Vector3(s,t,m),new THREE.Vector3(u,v,n)],null,i))}}var H=this,v=0,I=[],J=[],K,R,y;THREE.Geometry.call(this);THREE.Loader.prototype.initMaterials(H,d,b);(function(a,b,c){for(var a=new Uint8Array(a,b,c),d="",f=0;f<c;f++)d=d+String.fromCharCode(a[b+f]);return d})(a,v,12);c=B(a,v+12);B(a,v+13);B(a,v+14);B(a,v+15);e=B(a,v+16);k=B(a,v+17);i=B(a,v+18);h=B(a,v+19);n=x(a,v+20);m=x(a,v+20+4);o=x(a,v+20+8);b=x(a,v+20+12);q=
x(a,v+20+16);l=x(a,v+20+20);s=x(a,v+20+24);w=x(a,v+20+28);r=x(a,v+20+32);A=x(a,v+20+36);u=x(a,v+20+40);v=v+c;c=e*3+h;y=e*4+h;K=b*c;R=q*(c+k*3);e=l*(c+i*3);h=s*(c+k*3+i*3);c=w*y;k=r*(y+k*4);i=A*(y+i*4);v=v+function(b){var b=new Float32Array(a,b,n*3),c,d,f,e;for(c=0;c<n;c++){d=b[c*3];f=b[c*3+1];e=b[c*3+2];H.vertices.push(new THREE.Vector3(d,f,e))}return n*3*Float32Array.BYTES_PER_ELEMENT}(v);v=v+function(b){if(m){var b=new Int8Array(a,b,m*3),c,d,f,e;for(c=0;c<m;c++){d=b[c*3];f=b[c*3+1];e=b[c*3+2];I.push(d/
127,f/127,e/127)}}return m*3*Int8Array.BYTES_PER_ELEMENT}(v);v=v+t(m*3);v=v+function(b){if(o){var b=new Float32Array(a,b,o*2),c,d,f;for(c=0;c<o;c++){d=b[c*2];f=b[c*2+1];J.push(d,f)}}return o*2*Float32Array.BYTES_PER_ELEMENT}(v);K=v+K+t(b*2);R=K+R+t(q*2);e=R+e+t(l*2);h=e+h+t(s*2);c=h+c+t(w*2);k=c+k+t(r*2);i=k+i+t(A*2);(function(a){if(l){var b=a+l*Uint32Array.BYTES_PER_ELEMENT*3;C(l,a,b+l*Uint32Array.BYTES_PER_ELEMENT*3);D(l,b)}})(R);(function(a){if(s){var b=a+s*Uint32Array.BYTES_PER_ELEMENT*3,c=b+
s*Uint32Array.BYTES_PER_ELEMENT*3;E(s,a,b,c+s*Uint32Array.BYTES_PER_ELEMENT*3);D(s,c)}})(e);(function(a){if(A){var b=a+A*Uint32Array.BYTES_PER_ELEMENT*4;F(A,a,b+A*Uint32Array.BYTES_PER_ELEMENT*4);z(A,b)}})(k);(function(a){if(u){var b=a+u*Uint32Array.BYTES_PER_ELEMENT*4,c=b+u*Uint32Array.BYTES_PER_ELEMENT*4;L(u,a,b,c+u*Uint32Array.BYTES_PER_ELEMENT*4);z(u,c)}})(i);b&&C(b,v,v+b*Uint32Array.BYTES_PER_ELEMENT*3);(function(a){if(q){var b=a+q*Uint32Array.BYTES_PER_ELEMENT*3;E(q,a,b,b+q*Uint32Array.BYTES_PER_ELEMENT*
3)}})(K);w&&F(w,h,h+w*Uint32Array.BYTES_PER_ELEMENT*4);(function(a){if(r){var b=a+r*Uint32Array.BYTES_PER_ELEMENT*4;L(r,a,b,b+r*Uint32Array.BYTES_PER_ELEMENT*4)}})(c);this.computeCentroids();this.computeFaceNormals();THREE.Loader.prototype.hasNormals(this)&&this.computeTangents()};e.prototype=new THREE.Geometry;e.prototype.constructor=e;b(new e(c))};THREE.JSONLoader=function(a){THREE.Loader.call(this,a)};THREE.JSONLoader.prototype=new THREE.Loader;THREE.JSONLoader.prototype.constructor=THREE.JSONLoader;
THREE.JSONLoader.prototype.load=function(a,b,c){c=c?c:this.extractUrlBase(a);this.onLoadStart();this.loadAjaxJSON(this,a,b,c)};
THREE.JSONLoader.prototype.loadAjaxJSON=function(a,b,c,d,e){var f=new XMLHttpRequest,g=0;f.onreadystatechange=function(){if(f.readyState===f.DONE)if(f.status===200||f.status===0){if(f.responseText){var j=JSON.parse(f.responseText);a.createModel(j,c,d)}else console.warn("THREE.JSONLoader: ["+b+"] seems to be unreachable or file there is empty");a.onLoadComplete()}else console.error("THREE.JSONLoader: Couldn't load ["+b+"] ["+f.status+"]");else if(f.readyState===f.LOADING){if(e){g===0&&(g=f.getResponseHeader("Content-Length"));
e({total:g,loaded:f.responseText.length})}}else f.readyState===f.HEADERS_RECEIVED&&(g=f.getResponseHeader("Content-Length"))};f.open("GET",b,true);f.overrideMimeType&&f.overrideMimeType("text/plain; charset=x-user-defined");f.setRequestHeader("Content-Type","text/plain");f.send(null)};
THREE.JSONLoader.prototype.createModel=function(a,b,c){var d=new THREE.Geometry,e=a.scale!==void 0?1/a.scale:1;this.initMaterials(d,a.materials,c);(function(b){var c,e,k,i,h,n,m,o,q,l,s,w,r,A,u=a.faces;n=a.vertices;var t=a.normals,B=a.colors,x=0;for(c=0;c<a.uvs.length;c++)a.uvs[c].length&&x++;for(c=0;c<x;c++){d.faceUvs[c]=[];d.faceVertexUvs[c]=[]}i=0;for(h=n.length;i<h;){m=new THREE.Vector3;m.x=n[i++]*b;m.y=n[i++]*b;m.z=n[i++]*b;d.vertices.push(m)}i=0;for(h=u.length;i<h;){b=u[i++];n=b&1;k=b&2;c=b&
4;e=b&8;o=b&16;m=b&32;l=b&64;b=b&128;if(n){s=new THREE.Face4;s.a=u[i++];s.b=u[i++];s.c=u[i++];s.d=u[i++];n=4}else{s=new THREE.Face3;s.a=u[i++];s.b=u[i++];s.c=u[i++];n=3}if(k){k=u[i++];s.materialIndex=k}k=d.faces.length;if(c)for(c=0;c<x;c++){w=a.uvs[c];q=u[i++];A=w[q*2];q=w[q*2+1];d.faceUvs[c][k]=new THREE.UV(A,q)}if(e)for(c=0;c<x;c++){w=a.uvs[c];r=[];for(e=0;e<n;e++){q=u[i++];A=w[q*2];q=w[q*2+1];r[e]=new THREE.UV(A,q)}d.faceVertexUvs[c][k]=r}if(o){o=u[i++]*3;e=new THREE.Vector3;e.x=t[o++];e.y=t[o++];
e.z=t[o];s.normal=e}if(m)for(c=0;c<n;c++){o=u[i++]*3;e=new THREE.Vector3;e.x=t[o++];e.y=t[o++];e.z=t[o];s.vertexNormals.push(e)}if(l){m=u[i++];m=new THREE.Color(B[m]);s.color=m}if(b)for(c=0;c<n;c++){m=u[i++];m=new THREE.Color(B[m]);s.vertexColors.push(m)}d.faces.push(s)}})(e);(function(){var b,c,e,k;if(a.skinWeights){b=0;for(c=a.skinWeights.length;b<c;b=b+2){e=a.skinWeights[b];k=a.skinWeights[b+1];d.skinWeights.push(new THREE.Vector4(e,k,0,0))}}if(a.skinIndices){b=0;for(c=a.skinIndices.length;b<c;b=
b+2){e=a.skinIndices[b];k=a.skinIndices[b+1];d.skinIndices.push(new THREE.Vector4(e,k,0,0))}}d.bones=a.bones;d.animation=a.animation})();(function(b){if(a.morphTargets!==void 0){var c,e,k,i,h,n;c=0;for(e=a.morphTargets.length;c<e;c++){d.morphTargets[c]={};d.morphTargets[c].name=a.morphTargets[c].name;d.morphTargets[c].vertices=[];h=d.morphTargets[c].vertices;n=a.morphTargets[c].vertices;k=0;for(i=n.length;k<i;k=k+3){var m=new THREE.Vector3;m.x=n[k]*b;m.y=n[k+1]*b;m.z=n[k+2]*b;h.push(m)}}}if(a.morphColors!==
void 0){c=0;for(e=a.morphColors.length;c<e;c++){d.morphColors[c]={};d.morphColors[c].name=a.morphColors[c].name;d.morphColors[c].colors=[];i=d.morphColors[c].colors;h=a.morphColors[c].colors;b=0;for(k=h.length;b<k;b=b+3){n=new THREE.Color(16755200);n.setRGB(h[b],h[b+1],h[b+2]);i.push(n)}}}})(e);d.computeCentroids();d.computeFaceNormals();this.hasNormals(d)&&d.computeTangents();b(d)};
THREE.SceneLoader=function(){this.onLoadStart=function(){};this.onLoadProgress=function(){};this.onLoadComplete=function(){};this.callbackSync=function(){};this.callbackProgress=function(){}};THREE.SceneLoader.prototype.constructor=THREE.SceneLoader;
THREE.SceneLoader.prototype.load=function(a,b){var c=this,d=new XMLHttpRequest;d.onreadystatechange=function(){if(d.readyState==4)if(d.status==200||d.status==0){var e=JSON.parse(d.responseText);c.createScene(e,b,a)}else console.error("THREE.SceneLoader: Couldn't load ["+a+"] ["+d.status+"]")};d.open("GET",a,true);d.overrideMimeType&&d.overrideMimeType("text/plain; charset=x-user-defined");d.setRequestHeader("Content-Type","text/plain");d.send(null)};
THREE.SceneLoader.prototype.createScene=function(a,b,c){function d(a,b){return b=="relativeToHTML"?a:i+"/"+a}function e(){var a;for(m in v.objects)if(!p.objects[m]){w=v.objects[m];if(w.geometry!==void 0){if(F=p.geometries[w.geometry]){a=false;E=p.materials[w.materials[0]];(a=E instanceof THREE.ShaderMaterial)&&F.computeTangents();t=w.position;B=w.rotation;x=w.quaternion;D=w.scale;r=w.matrix;x=0;w.materials.length==0&&(E=new THREE.MeshFaceMaterial);w.materials.length>1&&(E=new THREE.MeshFaceMaterial);
a=new THREE.Mesh(F,E);a.name=m;if(r){a.matrixAutoUpdate=false;a.matrix.set(r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[9],r[10],r[11],r[12],r[13],r[14],r[15])}else{a.position.set(t[0],t[1],t[2]);if(x){a.quaternion.set(x[0],x[1],x[2],x[3]);a.useQuaternion=true}else a.rotation.set(B[0],B[1],B[2]);a.scale.set(D[0],D[1],D[2])}a.visible=w.visible;a.doubleSided=w.doubleSided;a.castShadow=w.castShadow;a.receiveShadow=w.receiveShadow;p.scene.add(a);p.objects[m]=a}}else{t=w.position;B=w.rotation;x=w.quaternion;
D=w.scale;x=0;a=new THREE.Object3D;a.name=m;a.position.set(t[0],t[1],t[2]);if(x){a.quaternion.set(x[0],x[1],x[2],x[3]);a.useQuaternion=true}else a.rotation.set(B[0],B[1],B[2]);a.scale.set(D[0],D[1],D[2]);a.visible=w.visible!==void 0?w.visible:false;p.scene.add(a);p.objects[m]=a;p.empties[m]=a}}}function f(a){return function(b){p.geometries[a]=b;e();J=J-1;k.onLoadComplete();j()}}function g(a){return function(b){p.geometries[a]=b}}function j(){k.callbackProgress({totalModels:R,totalTextures:y,loadedModels:R-
J,loadedTextures:y-K},p);k.onLoadProgress();J==0&&K==0&&b(p)}var k=this,i=THREE.Loader.prototype.extractUrlBase(c),h,n,m,o,q,l,s,w,r,A,u,t,B,x,D,z,C,F,E,L,H,v,I,J,K,R,y,p;v=a;c=new THREE.BinaryLoader;I=new THREE.JSONLoader;K=J=0;p={scene:new THREE.Scene,geometries:{},materials:{},textures:{},objects:{},cameras:{},lights:{},fogs:{},empties:{}};if(v.transform){a=v.transform.position;A=v.transform.rotation;z=v.transform.scale;a&&p.scene.position.set(a[0],a[1],a[2]);A&&p.scene.rotation.set(A[0],A[1],
A[2]);z&&p.scene.scale.set(z[0],z[1],z[2]);if(a||A||z){p.scene.updateMatrix();p.scene.updateMatrixWorld()}}a=function(){K=K-1;j();k.onLoadComplete()};for(q in v.cameras){z=v.cameras[q];z.type=="perspective"?L=new THREE.PerspectiveCamera(z.fov,z.aspect,z.near,z.far):z.type=="ortho"&&(L=new THREE.OrthographicCamera(z.left,z.right,z.top,z.bottom,z.near,z.far));t=z.position;A=z.target;z=z.up;L.position.set(t[0],t[1],t[2]);L.target=new THREE.Vector3(A[0],A[1],A[2]);z&&L.up.set(z[0],z[1],z[2]);p.cameras[q]=
L}for(o in v.lights){A=v.lights[o];q=A.color!==void 0?A.color:16777215;L=A.intensity!==void 0?A.intensity:1;if(A.type=="directional"){t=A.direction;u=new THREE.DirectionalLight(q,L);u.position.set(t[0],t[1],t[2]);u.position.normalize()}else if(A.type=="point"){t=A.position;u=A.distance;u=new THREE.PointLight(q,L,u);u.position.set(t[0],t[1],t[2])}else A.type=="ambient"&&(u=new THREE.AmbientLight(q));p.scene.add(u);p.lights[o]=u}for(l in v.fogs){o=v.fogs[l];o.type=="linear"?H=new THREE.Fog(0,o.near,
o.far):o.type=="exp2"&&(H=new THREE.FogExp2(0,o.density));z=o.color;H.color.setRGB(z[0],z[1],z[2]);p.fogs[l]=H}if(p.cameras&&v.defaults.camera)p.currentCamera=p.cameras[v.defaults.camera];if(p.fogs&&v.defaults.fog)p.scene.fog=p.fogs[v.defaults.fog];z=v.defaults.bgcolor;p.bgColor=new THREE.Color;p.bgColor.setRGB(z[0],z[1],z[2]);p.bgColorAlpha=v.defaults.bgalpha;for(h in v.geometries){l=v.geometries[h];if(l.type=="bin_mesh"||l.type=="ascii_mesh"){J=J+1;k.onLoadStart()}}R=J;for(h in v.geometries){l=
v.geometries[h];if(l.type=="cube"){F=new THREE.CubeGeometry(l.width,l.height,l.depth,l.segmentsWidth,l.segmentsHeight,l.segmentsDepth,null,l.flipped,l.sides);p.geometries[h]=F}else if(l.type=="plane"){F=new THREE.PlaneGeometry(l.width,l.height,l.segmentsWidth,l.segmentsHeight);p.geometries[h]=F}else if(l.type=="sphere"){F=new THREE.SphereGeometry(l.radius,l.segmentsWidth,l.segmentsHeight);p.geometries[h]=F}else if(l.type=="cylinder"){F=new THREE.CylinderGeometry(l.topRad,l.botRad,l.height,l.radSegs,
l.heightSegs);p.geometries[h]=F}else if(l.type=="torus"){F=new THREE.TorusGeometry(l.radius,l.tube,l.segmentsR,l.segmentsT);p.geometries[h]=F}else if(l.type=="icosahedron"){F=new THREE.IcosahedronGeometry(l.radius,l.subdivisions);p.geometries[h]=F}else if(l.type=="bin_mesh")c.load(d(l.url,v.urlBaseType),f(h));else if(l.type=="ascii_mesh")I.load(d(l.url,v.urlBaseType),f(h));else if(l.type=="embedded_mesh"){l=v.embeds[l.id];l.metadata=v.metadata;l&&I.createModel(l,g(h),"")}}for(s in v.textures){h=v.textures[s];
if(h.url instanceof Array){K=K+h.url.length;for(l=0;l<h.url.length;l++)k.onLoadStart()}else{K=K+1;k.onLoadStart()}}y=K;for(s in v.textures){h=v.textures[s];if(h.mapping!=void 0&&THREE[h.mapping]!=void 0)h.mapping=new THREE[h.mapping];if(h.url instanceof Array){l=[];for(H=0;H<h.url.length;H++)l[H]=d(h.url[H],v.urlBaseType);l=THREE.ImageUtils.loadTextureCube(l,h.mapping,a)}else{l=THREE.ImageUtils.loadTexture(d(h.url,v.urlBaseType),h.mapping,a);if(THREE[h.minFilter]!=void 0)l.minFilter=THREE[h.minFilter];
if(THREE[h.magFilter]!=void 0)l.magFilter=THREE[h.magFilter];if(h.repeat){l.repeat.set(h.repeat[0],h.repeat[1]);if(h.repeat[0]!=1)l.wrapS=THREE.RepeatWrapping;if(h.repeat[1]!=1)l.wrapT=THREE.RepeatWrapping}h.offset&&l.offset.set(h.offset[0],h.offset[1]);if(h.wrap){H={repeat:THREE.RepeatWrapping,mirror:THREE.MirroredRepeatWrapping};if(H[h.wrap[0]]!==void 0)l.wrapS=H[h.wrap[0]];if(H[h.wrap[1]]!==void 0)l.wrapT=H[h.wrap[1]]}}p.textures[s]=l}for(n in v.materials){r=v.materials[n];for(C in r.parameters)if(C==
"envMap"||C=="map"||C=="lightMap")r.parameters[C]=p.textures[r.parameters[C]];else if(C=="shading")r.parameters[C]=r.parameters[C]=="flat"?THREE.FlatShading:THREE.SmoothShading;else if(C=="blending")r.parameters[C]=THREE[r.parameters[C]]?THREE[r.parameters[C]]:THREE.NormalBlending;else if(C=="combine")r.parameters[C]=r.parameters[C]=="MixOperation"?THREE.MixOperation:THREE.MultiplyOperation;else if(C=="vertexColors")if(r.parameters[C]=="face")r.parameters[C]=THREE.FaceColors;else if(r.parameters[C])r.parameters[C]=
THREE.VertexColors;if(r.parameters.opacity!==void 0&&r.parameters.opacity<1)r.parameters.transparent=true;if(r.parameters.normalMap){s=THREE.ShaderUtils.lib.normal;a=THREE.UniformsUtils.clone(s.uniforms);h=r.parameters.color;l=r.parameters.specular;H=r.parameters.ambient;c=r.parameters.shininess;a.tNormal.texture=p.textures[r.parameters.normalMap];if(r.parameters.normalMapFactor)a.uNormalScale.value=r.parameters.normalMapFactor;if(r.parameters.map){a.tDiffuse.texture=r.parameters.map;a.enableDiffuse.value=
true}if(r.parameters.lightMap){a.tAO.texture=r.parameters.lightMap;a.enableAO.value=true}if(r.parameters.specularMap){a.tSpecular.texture=p.textures[r.parameters.specularMap];a.enableSpecular.value=true}a.uDiffuseColor.value.setHex(h);a.uSpecularColor.value.setHex(l);a.uAmbientColor.value.setHex(H);a.uShininess.value=c;if(r.parameters.opacity)a.uOpacity.value=r.parameters.opacity;E=new THREE.ShaderMaterial({fragmentShader:s.fragmentShader,vertexShader:s.vertexShader,uniforms:a,lights:true,fog:true})}else E=
new THREE[r.type](r.parameters);p.materials[n]=E}e();k.callbackSync(p);j()};
THREE.Material=function(a){a=a||{};this.id=THREE.MaterialCount++;this.name="";this.opacity=a.opacity!==void 0?a.opacity:1;this.transparent=a.transparent!==void 0?a.transparent:false;this.blending=a.blending!==void 0?a.blending:THREE.NormalBlending;this.blendSrc=a.blendSrc!==void 0?a.blendSrc:THREE.SrcAlphaFactor;this.blendDst=a.blendDst!==void 0?a.blendDst:THREE.OneMinusSrcAlphaFactor;this.blendEquation=a.blendEquation!==void 0?a.blendEquation:THREE.AddEquation;this.depthTest=a.depthTest!==void 0?
a.depthTest:true;this.depthWrite=a.depthWrite!==void 0?a.depthWrite:true;this.polygonOffset=a.polygonOffset!==void 0?a.polygonOffset:false;this.polygonOffsetFactor=a.polygonOffsetFactor!==void 0?a.polygonOffsetFactor:0;this.polygonOffsetUnits=a.polygonOffsetUnits!==void 0?a.polygonOffsetUnits:0;this.alphaTest=a.alphaTest!==void 0?a.alphaTest:0;this.overdraw=a.overdraw!==void 0?a.overdraw:false;this.needsUpdate=this.visible=true};THREE.MaterialCount=0;THREE.NoShading=0;THREE.FlatShading=1;
THREE.SmoothShading=2;THREE.NoColors=0;THREE.FaceColors=1;THREE.VertexColors=2;THREE.NoBlending=0;THREE.NormalBlending=1;THREE.AdditiveBlending=2;THREE.SubtractiveBlending=3;THREE.MultiplyBlending=4;THREE.AdditiveAlphaBlending=5;THREE.CustomBlending=6;THREE.AddEquation=100;THREE.SubtractEquation=101;THREE.ReverseSubtractEquation=102;THREE.ZeroFactor=200;THREE.OneFactor=201;THREE.SrcColorFactor=202;THREE.OneMinusSrcColorFactor=203;THREE.SrcAlphaFactor=204;THREE.OneMinusSrcAlphaFactor=205;
THREE.DstAlphaFactor=206;THREE.OneMinusDstAlphaFactor=207;THREE.DstColorFactor=208;THREE.OneMinusDstColorFactor=209;THREE.SrcAlphaSaturateFactor=210;
THREE.LineBasicMaterial=function(a){THREE.Material.call(this,a);a=a||{};this.color=a.color!==void 0?new THREE.Color(a.color):new THREE.Color(16777215);this.linewidth=a.linewidth!==void 0?a.linewidth:1;this.linecap=a.linecap!==void 0?a.linecap:"round";this.linejoin=a.linejoin!==void 0?a.linejoin:"round";this.vertexColors=a.vertexColors?a.vertexColors:false;this.fog=a.fog!==void 0?a.fog:true};THREE.LineBasicMaterial.prototype=new THREE.Material;THREE.LineBasicMaterial.prototype.constructor=THREE.LineBasicMaterial;
THREE.MeshBasicMaterial=function(a){THREE.Material.call(this,a);a=a||{};this.color=a.color!==void 0?new THREE.Color(a.color):new THREE.Color(16777215);this.map=a.map!==void 0?a.map:null;this.lightMap=a.lightMap!==void 0?a.lightMap:null;this.envMap=a.envMap!==void 0?a.envMap:null;this.combine=a.combine!==void 0?a.combine:THREE.MultiplyOperation;this.reflectivity=a.reflectivity!==void 0?a.reflectivity:1;this.refractionRatio=a.refractionRatio!==void 0?a.refractionRatio:0.98;this.fog=a.fog!==void 0?a.fog:
true;this.shading=a.shading!==void 0?a.shading:THREE.SmoothShading;this.wireframe=a.wireframe!==void 0?a.wireframe:false;this.wireframeLinewidth=a.wireframeLinewidth!==void 0?a.wireframeLinewidth:1;this.wireframeLinecap=a.wireframeLinecap!==void 0?a.wireframeLinecap:"round";this.wireframeLinejoin=a.wireframeLinejoin!==void 0?a.wireframeLinejoin:"round";this.vertexColors=a.vertexColors!==void 0?a.vertexColors:THREE.NoColors;this.skinning=a.skinning!==void 0?a.skinning:false;this.morphTargets=a.morphTargets!==
void 0?a.morphTargets:false};THREE.MeshBasicMaterial.prototype=new THREE.Material;THREE.MeshBasicMaterial.prototype.constructor=THREE.MeshBasicMaterial;
THREE.MeshLambertMaterial=function(a){THREE.Material.call(this,a);a=a||{};this.color=a.color!==void 0?new THREE.Color(a.color):new THREE.Color(16777215);this.ambient=a.ambient!==void 0?new THREE.Color(a.ambient):new THREE.Color(16777215);this.emissive=a.emissive!==void 0?new THREE.Color(a.emissive):new THREE.Color(0);this.wrapAround=a.wrapAround!==void 0?a.wrapAround:false;this.wrapRGB=new THREE.Vector3(1,1,1);this.map=a.map!==void 0?a.map:null;this.lightMap=a.lightMap!==void 0?a.lightMap:null;this.envMap=
a.envMap!==void 0?a.envMap:null;this.combine=a.combine!==void 0?a.combine:THREE.MultiplyOperation;this.reflectivity=a.reflectivity!==void 0?a.reflectivity:1;this.refractionRatio=a.refractionRatio!==void 0?a.refractionRatio:0.98;this.fog=a.fog!==void 0?a.fog:true;this.shading=a.shading!==void 0?a.shading:THREE.SmoothShading;this.wireframe=a.wireframe!==void 0?a.wireframe:false;this.wireframeLinewidth=a.wireframeLinewidth!==void 0?a.wireframeLinewidth:1;this.wireframeLinecap=a.wireframeLinecap!==void 0?
a.wireframeLinecap:"round";this.wireframeLinejoin=a.wireframeLinejoin!==void 0?a.wireframeLinejoin:"round";this.vertexColors=a.vertexColors!==void 0?a.vertexColors:THREE.NoColors;this.skinning=a.skinning!==void 0?a.skinning:false;this.morphTargets=a.morphTargets!==void 0?a.morphTargets:false;this.morphNormals=a.morphNormals!==void 0?a.morphNormals:false};THREE.MeshLambertMaterial.prototype=new THREE.Material;THREE.MeshLambertMaterial.prototype.constructor=THREE.MeshLambertMaterial;
THREE.MeshPhongMaterial=function(a){THREE.Material.call(this,a);a=a||{};this.color=a.color!==void 0?new THREE.Color(a.color):new THREE.Color(16777215);this.ambient=a.ambient!==void 0?new THREE.Color(a.ambient):new THREE.Color(16777215);this.emissive=a.emissive!==void 0?new THREE.Color(a.emissive):new THREE.Color(0);this.specular=a.specular!==void 0?new THREE.Color(a.specular):new THREE.Color(1118481);this.shininess=a.shininess!==void 0?a.shininess:30;this.metal=a.metal!==void 0?a.metal:false;this.perPixel=
a.perPixel!==void 0?a.perPixel:false;this.wrapAround=a.wrapAround!==void 0?a.wrapAround:false;this.wrapRGB=new THREE.Vector3(1,1,1);this.map=a.map!==void 0?a.map:null;this.lightMap=a.lightMap!==void 0?a.lightMap:null;this.envMap=a.envMap!==void 0?a.envMap:null;this.combine=a.combine!==void 0?a.combine:THREE.MultiplyOperation;this.reflectivity=a.reflectivity!==void 0?a.reflectivity:1;this.refractionRatio=a.refractionRatio!==void 0?a.refractionRatio:0.98;this.fog=a.fog!==void 0?a.fog:true;this.shading=
a.shading!==void 0?a.shading:THREE.SmoothShading;this.wireframe=a.wireframe!==void 0?a.wireframe:false;this.wireframeLinewidth=a.wireframeLinewidth!==void 0?a.wireframeLinewidth:1;this.wireframeLinecap=a.wireframeLinecap!==void 0?a.wireframeLinecap:"round";this.wireframeLinejoin=a.wireframeLinejoin!==void 0?a.wireframeLinejoin:"round";this.vertexColors=a.vertexColors!==void 0?a.vertexColors:THREE.NoColors;this.skinning=a.skinning!==void 0?a.skinning:false;this.morphTargets=a.morphTargets!==void 0?
a.morphTargets:false;this.morphNormals=a.morphNormals!==void 0?a.morphNormals:false};THREE.MeshPhongMaterial.prototype=new THREE.Material;THREE.MeshPhongMaterial.prototype.constructor=THREE.MeshPhongMaterial;THREE.MeshDepthMaterial=function(a){THREE.Material.call(this,a);a=a||{};this.shading=a.shading!==void 0?a.shading:THREE.SmoothShading;this.wireframe=a.wireframe!==void 0?a.wireframe:false;this.wireframeLinewidth=a.wireframeLinewidth!==void 0?a.wireframeLinewidth:1};
THREE.MeshDepthMaterial.prototype=new THREE.Material;THREE.MeshDepthMaterial.prototype.constructor=THREE.MeshDepthMaterial;THREE.MeshNormalMaterial=function(a){THREE.Material.call(this,a);a=a||{};this.shading=a.shading?a.shading:THREE.FlatShading;this.wireframe=a.wireframe?a.wireframe:false;this.wireframeLinewidth=a.wireframeLinewidth?a.wireframeLinewidth:1};THREE.MeshNormalMaterial.prototype=new THREE.Material;THREE.MeshNormalMaterial.prototype.constructor=THREE.MeshNormalMaterial;
THREE.MeshFaceMaterial=function(){};THREE.ParticleBasicMaterial=function(a){THREE.Material.call(this,a);a=a||{};this.color=a.color!==void 0?new THREE.Color(a.color):new THREE.Color(16777215);this.map=a.map!==void 0?a.map:null;this.size=a.size!==void 0?a.size:1;this.sizeAttenuation=a.sizeAttenuation!==void 0?a.sizeAttenuation:true;this.vertexColors=a.vertexColors!==void 0?a.vertexColors:false;this.fog=a.fog!==void 0?a.fog:true};THREE.ParticleBasicMaterial.prototype=new THREE.Material;
THREE.ParticleBasicMaterial.prototype.constructor=THREE.ParticleBasicMaterial;
THREE.Texture=function(a,b,c,d,e,f,g,j){this.id=THREE.TextureCount++;this.image=a;this.mapping=b!==void 0?b:new THREE.UVMapping;this.wrapS=c!==void 0?c:THREE.ClampToEdgeWrapping;this.wrapT=d!==void 0?d:THREE.ClampToEdgeWrapping;this.magFilter=e!==void 0?e:THREE.LinearFilter;this.minFilter=f!==void 0?f:THREE.LinearMipMapLinearFilter;this.format=g!==void 0?g:THREE.RGBAFormat;this.type=j!==void 0?j:THREE.UnsignedByteType;this.offset=new THREE.Vector2(0,0);this.repeat=new THREE.Vector2(1,1);this.generateMipmaps=
true;this.needsUpdate=this.premultiplyAlpha=false;this.onUpdate=null};THREE.Texture.prototype={constructor:THREE.Texture,clone:function(){var a=new THREE.Texture(this.image,this.mapping,this.wrapS,this.wrapT,this.magFilter,this.minFilter,this.format,this.type);a.offset.copy(this.offset);a.repeat.copy(this.repeat);return a}};THREE.TextureCount=0;THREE.MultiplyOperation=0;THREE.MixOperation=1;THREE.UVMapping=function(){};THREE.CubeReflectionMapping=function(){};THREE.CubeRefractionMapping=function(){};
THREE.SphericalReflectionMapping=function(){};THREE.SphericalRefractionMapping=function(){};THREE.RepeatWrapping=0;THREE.ClampToEdgeWrapping=1;THREE.MirroredRepeatWrapping=2;THREE.NearestFilter=3;THREE.NearestMipMapNearestFilter=4;THREE.NearestMipMapLinearFilter=5;THREE.LinearFilter=6;THREE.LinearMipMapNearestFilter=7;THREE.LinearMipMapLinearFilter=8;THREE.ByteType=9;THREE.UnsignedByteType=10;THREE.ShortType=11;THREE.UnsignedShortType=12;THREE.IntType=13;THREE.UnsignedIntType=14;THREE.FloatType=15;
THREE.AlphaFormat=16;THREE.RGBFormat=17;THREE.RGBAFormat=18;THREE.LuminanceFormat=19;THREE.LuminanceAlphaFormat=20;THREE.DataTexture=function(a,b,c,d,e,f,g,j,k,i){THREE.Texture.call(this,null,f,g,j,k,i,d,e);this.image={data:a,width:b,height:c}};THREE.DataTexture.prototype=new THREE.Texture;THREE.DataTexture.prototype.constructor=THREE.DataTexture;
THREE.DataTexture.prototype.clone=function(){var a=new THREE.DataTexture(this.image.data,this.image.width,this.image.height,this.format,this.type,this.mapping,this.wrapS,this.wrapT,this.magFilter,this.minFilter);a.offset.copy(this.offset);a.repeat.copy(this.repeat);return a};THREE.Particle=function(a){THREE.Object3D.call(this);this.material=a};THREE.Particle.prototype=new THREE.Object3D;THREE.Particle.prototype.constructor=THREE.Particle;
THREE.Line=function(a,b,c){THREE.Object3D.call(this);this.geometry=a;this.material=b!==void 0?b:new THREE.LineBasicMaterial({color:Math.random()*16777215});this.type=c!==void 0?c:THREE.LineStrip;this.geometry&&(this.geometry.boundingSphere||this.geometry.computeBoundingSphere())};THREE.LineStrip=0;THREE.LinePieces=1;THREE.Line.prototype=new THREE.Object3D;THREE.Line.prototype.constructor=THREE.Line;
THREE.Mesh=function(a,b){THREE.Object3D.call(this);this.geometry=a;this.material=b!==void 0?b:new THREE.MeshBasicMaterial({color:Math.random()*16777215,wireframe:true});if(this.geometry){this.geometry.boundingSphere||this.geometry.computeBoundingSphere();this.boundRadius=a.boundingSphere.radius;if(this.geometry.morphTargets.length){this.morphTargetBase=-1;this.morphTargetForcedOrder=[];this.morphTargetInfluences=[];this.morphTargetDictionary={};for(var c=0;c<this.geometry.morphTargets.length;c++){this.morphTargetInfluences.push(0);
this.morphTargetDictionary[this.geometry.morphTargets[c].name]=c}}}};THREE.Mesh.prototype=new THREE.Object3D;THREE.Mesh.prototype.constructor=THREE.Mesh;THREE.Mesh.prototype.supr=THREE.Object3D.prototype;THREE.Mesh.prototype.getMorphTargetIndexByName=function(a){if(this.morphTargetDictionary[a]!==void 0)return this.morphTargetDictionary[a];console.log("THREE.Mesh.getMorphTargetIndexByName: morph target "+a+" does not exist. Returning 0.");return 0};
THREE.Bone=function(a){THREE.Object3D.call(this);this.skin=a;this.skinMatrix=new THREE.Matrix4};THREE.Bone.prototype=new THREE.Object3D;THREE.Bone.prototype.constructor=THREE.Bone;THREE.Bone.prototype.supr=THREE.Object3D.prototype;
THREE.Bone.prototype.update=function(a,b){this.matrixAutoUpdate&&(b=b|this.updateMatrix());if(b||this.matrixWorldNeedsUpdate){a?this.skinMatrix.multiply(a,this.matrix):this.skinMatrix.copy(this.matrix);this.matrixWorldNeedsUpdate=false;b=true}var c,d=this.children.length;for(c=0;c<d;c++)this.children[c].update(this.skinMatrix,b)};
THREE.Sprite=function(a){THREE.Object3D.call(this);this.color=a.color!==void 0?new THREE.Color(a.color):new THREE.Color(16777215);this.map=a.map!==void 0?a.map:new THREE.Texture;this.blending=a.blending!==void 0?a.blending:THREE.NormalBlending;this.blendSrc=a.blendSrc!==void 0?a.blendSrc:THREE.SrcAlphaFactor;this.blendDst=a.blendDst!==void 0?a.blendDst:THREE.OneMinusSrcAlphaFactor;this.blendEquation=a.blendEquation!==void 0?a.blendEquation:THREE.AddEquation;this.useScreenCoordinates=a.useScreenCoordinates!==
void 0?a.useScreenCoordinates:true;this.mergeWith3D=a.mergeWith3D!==void 0?a.mergeWith3D:!this.useScreenCoordinates;this.affectedByDistance=a.affectedByDistance!==void 0?a.affectedByDistance:!this.useScreenCoordinates;this.scaleByViewport=a.scaleByViewport!==void 0?a.scaleByViewport:!this.affectedByDistance;this.alignment=a.alignment instanceof THREE.Vector2?a.alignment:THREE.SpriteAlignment.center;this.rotation3d=this.rotation;this.rotation=0;this.opacity=1;this.uvOffset=new THREE.Vector2(0,0);this.uvScale=
new THREE.Vector2(1,1)};THREE.Sprite.prototype=new THREE.Object3D;THREE.Sprite.prototype.constructor=THREE.Sprite;THREE.Sprite.prototype.updateMatrix=function(){this.matrix.setPosition(this.position);this.rotation3d.set(0,0,this.rotation);this.matrix.setRotationFromEuler(this.rotation3d);if(this.scale.x!==1||this.scale.y!==1){this.matrix.scale(this.scale);this.boundRadiusScale=Math.max(this.scale.x,this.scale.y)}this.matrixWorldNeedsUpdate=true};THREE.SpriteAlignment={};
THREE.SpriteAlignment.topLeft=new THREE.Vector2(1,-1);THREE.SpriteAlignment.topCenter=new THREE.Vector2(0,-1);THREE.SpriteAlignment.topRight=new THREE.Vector2(-1,-1);THREE.SpriteAlignment.centerLeft=new THREE.Vector2(1,0);THREE.SpriteAlignment.center=new THREE.Vector2(0,0);THREE.SpriteAlignment.centerRight=new THREE.Vector2(-1,0);THREE.SpriteAlignment.bottomLeft=new THREE.Vector2(1,1);THREE.SpriteAlignment.bottomCenter=new THREE.Vector2(0,1);
THREE.SpriteAlignment.bottomRight=new THREE.Vector2(-1,1);THREE.Scene=function(){THREE.Object3D.call(this);this.overrideMaterial=this.fog=null;this.matrixAutoUpdate=false;this.__objects=[];this.__lights=[];this.__objectsAdded=[];this.__objectsRemoved=[]};THREE.Scene.prototype=new THREE.Object3D;THREE.Scene.prototype.constructor=THREE.Scene;
THREE.Scene.prototype.__addObject=function(a){if(a instanceof THREE.Light)this.__lights.indexOf(a)===-1&&this.__lights.push(a);else if(!(a instanceof THREE.Camera||a instanceof THREE.Bone)&&this.__objects.indexOf(a)===-1){this.__objects.push(a);this.__objectsAdded.push(a);var b=this.__objectsRemoved.indexOf(a);b!==-1&&this.__objectsRemoved.splice(b,1)}for(b=0;b<a.children.length;b++)this.__addObject(a.children[b])};
THREE.Scene.prototype.__removeObject=function(a){if(a instanceof THREE.Light){var b=this.__lights.indexOf(a);b!==-1&&this.__lights.splice(b,1)}else if(!(a instanceof THREE.Camera)){b=this.__objects.indexOf(a);if(b!==-1){this.__objects.splice(b,1);this.__objectsRemoved.push(a);b=this.__objectsAdded.indexOf(a);b!==-1&&this.__objectsAdded.splice(b,1)}}for(b=0;b<a.children.length;b++)this.__removeObject(a.children[b])};
THREE.SVGRenderer=function(){function a(a,b,c,d){var e,f,g,h,i,j;e=0;for(f=a.length;e<f;e++){g=a[e];h=g.color;if(g instanceof THREE.DirectionalLight){i=g.matrixWorld.getPosition();j=c.dot(i);if(!(j<=0)){j=j*g.intensity;d.r=d.r+h.r*j;d.g=d.g+h.g*j;d.b=d.b+h.b*j}}else if(g instanceof THREE.PointLight){i=g.matrixWorld.getPosition();j=c.dot(z.sub(i,b).normalize());if(!(j<=0)){j=j*(g.distance==0?1:1-Math.min(b.distanceTo(i)/g.distance,1));if(j!=0){j=j*g.intensity;d.r=d.r+h.r*j;d.g=d.g+h.g*j;d.b=d.b+h.b*
j}}}}}function b(a){if(C[a]==null){C[a]=document.createElementNS("http://www.w3.org/2000/svg","path");v==0&&C[a].setAttribute("shape-rendering","crispEdges")}return C[a]}function c(a){a=(a+1)*0.5;return a<0?0:a>1?1:a}console.log("THREE.SVGRenderer",THREE.REVISION);var d=this,e,f,g,j=new THREE.Projector,k=document.createElementNS("http://www.w3.org/2000/svg","svg"),i,h,n,m,o,q,l,s,w=new THREE.Rectangle,r=new THREE.Rectangle,A=false,u=new THREE.Color,t=new THREE.Color,B=new THREE.Color,x=new THREE.Color,
D,z=new THREE.Vector3,C=[],F=[],E,L,H,v=1;this.domElement=k;this.sortElements=this.sortObjects=this.autoClear=true;this.info={render:{vertices:0,faces:0}};this.setQuality=function(a){switch(a){case "high":v=1;break;case "low":v=0}};this.setSize=function(a,b){i=a;h=b;n=i/2;m=h/2;k.setAttribute("viewBox",-n+" "+-m+" "+i+" "+h);k.setAttribute("width",i);k.setAttribute("height",h);w.set(-n,-m,n,m)};this.clear=function(){for(;k.childNodes.length>0;)k.removeChild(k.childNodes[0])};this.render=function(h,
i){var z,C,y,p;this.autoClear&&this.clear();d.info.render.vertices=0;d.info.render.faces=0;e=j.projectScene(h,i,this.sortElements);f=e.elements;g=e.lights;H=L=0;if(A=g.length>0){t.setRGB(0,0,0);B.setRGB(0,0,0);x.setRGB(0,0,0);z=0;for(C=g.length;z<C;z++){p=g[z];y=p.color;if(p instanceof THREE.AmbientLight){t.r=t.r+y.r;t.g=t.g+y.g;t.b=t.b+y.b}else if(p instanceof THREE.DirectionalLight){B.r=B.r+y.r;B.g=B.g+y.g;B.b=B.b+y.b}else if(p instanceof THREE.PointLight){x.r=x.r+y.r;x.g=x.g+y.g;x.b=x.b+y.b}}}z=
0;for(C=f.length;z<C;z++){y=f[z];p=y.material;p=p instanceof THREE.MeshFaceMaterial?y.faceMaterial:p;if(!(p===void 0||p.visible===false)){r.empty();if(y instanceof THREE.RenderableParticle){o=y;o.x=o.x*n;o.y=o.y*-m}else if(y instanceof THREE.RenderableLine){o=y.v1;q=y.v2;o.positionScreen.x=o.positionScreen.x*n;o.positionScreen.y=o.positionScreen.y*-m;q.positionScreen.x=q.positionScreen.x*n;q.positionScreen.y=q.positionScreen.y*-m;r.addPoint(o.positionScreen.x,o.positionScreen.y);r.addPoint(q.positionScreen.x,
q.positionScreen.y);if(w.intersects(r)){y=o;var P=q,G=H++;if(F[G]==null){F[G]=document.createElementNS("http://www.w3.org/2000/svg","line");v==0&&F[G].setAttribute("shape-rendering","crispEdges")}E=F[G];E.setAttribute("x1",y.positionScreen.x);E.setAttribute("y1",y.positionScreen.y);E.setAttribute("x2",P.positionScreen.x);E.setAttribute("y2",P.positionScreen.y);if(p instanceof THREE.LineBasicMaterial){E.setAttribute("style","fill: none; stroke: "+p.color.getContextStyle()+"; stroke-width: "+p.linewidth+
"; stroke-opacity: "+p.opacity+"; stroke-linecap: "+p.linecap+"; stroke-linejoin: "+p.linejoin);k.appendChild(E)}}}else if(y instanceof THREE.RenderableFace3){o=y.v1;q=y.v2;l=y.v3;o.positionScreen.x=o.positionScreen.x*n;o.positionScreen.y=o.positionScreen.y*-m;q.positionScreen.x=q.positionScreen.x*n;q.positionScreen.y=q.positionScreen.y*-m;l.positionScreen.x=l.positionScreen.x*n;l.positionScreen.y=l.positionScreen.y*-m;r.addPoint(o.positionScreen.x,o.positionScreen.y);r.addPoint(q.positionScreen.x,
q.positionScreen.y);r.addPoint(l.positionScreen.x,l.positionScreen.y);if(w.intersects(r)){var P=o,G=q,N=l;d.info.render.vertices=d.info.render.vertices+3;d.info.render.faces++;E=b(L++);E.setAttribute("d","M "+P.positionScreen.x+" "+P.positionScreen.y+" L "+G.positionScreen.x+" "+G.positionScreen.y+" L "+N.positionScreen.x+","+N.positionScreen.y+"z");if(p instanceof THREE.MeshBasicMaterial)u.copy(p.color);else if(p instanceof THREE.MeshLambertMaterial)if(A){u.r=t.r;u.g=t.g;u.b=t.b;a(g,y.centroidWorld,
y.normalWorld,u);u.r=Math.max(0,Math.min(p.color.r*u.r,1));u.g=Math.max(0,Math.min(p.color.g*u.g,1));u.b=Math.max(0,Math.min(p.color.b*u.b,1))}else u.copy(p.color);else if(p instanceof THREE.MeshDepthMaterial){D=1-p.__2near/(p.__farPlusNear-y.z*p.__farMinusNear);u.setRGB(D,D,D)}else p instanceof THREE.MeshNormalMaterial&&u.setRGB(c(y.normalWorld.x),c(y.normalWorld.y),c(y.normalWorld.z));p.wireframe?E.setAttribute("style","fill: none; stroke: "+u.getContextStyle()+"; stroke-width: "+p.wireframeLinewidth+
"; stroke-opacity: "+p.opacity+"; stroke-linecap: "+p.wireframeLinecap+"; stroke-linejoin: "+p.wireframeLinejoin):E.setAttribute("style","fill: "+u.getContextStyle()+"; fill-opacity: "+p.opacity);k.appendChild(E)}}else if(y instanceof THREE.RenderableFace4){o=y.v1;q=y.v2;l=y.v3;s=y.v4;o.positionScreen.x=o.positionScreen.x*n;o.positionScreen.y=o.positionScreen.y*-m;q.positionScreen.x=q.positionScreen.x*n;q.positionScreen.y=q.positionScreen.y*-m;l.positionScreen.x=l.positionScreen.x*n;l.positionScreen.y=
l.positionScreen.y*-m;s.positionScreen.x=s.positionScreen.x*n;s.positionScreen.y=s.positionScreen.y*-m;r.addPoint(o.positionScreen.x,o.positionScreen.y);r.addPoint(q.positionScreen.x,q.positionScreen.y);r.addPoint(l.positionScreen.x,l.positionScreen.y);r.addPoint(s.positionScreen.x,s.positionScreen.y);if(w.intersects(r)){var P=o,G=q,N=l,O=s;d.info.render.vertices=d.info.render.vertices+4;d.info.render.faces++;E=b(L++);E.setAttribute("d","M "+P.positionScreen.x+" "+P.positionScreen.y+" L "+G.positionScreen.x+
" "+G.positionScreen.y+" L "+N.positionScreen.x+","+N.positionScreen.y+" L "+O.positionScreen.x+","+O.positionScreen.y+"z");if(p instanceof THREE.MeshBasicMaterial)u.copy(p.color);else if(p instanceof THREE.MeshLambertMaterial)if(A){u.r=t.r;u.g=t.g;u.b=t.b;a(g,y.centroidWorld,y.normalWorld,u);u.r=Math.max(0,Math.min(p.color.r*u.r,1));u.g=Math.max(0,Math.min(p.color.g*u.g,1));u.b=Math.max(0,Math.min(p.color.b*u.b,1))}else u.copy(p.color);else if(p instanceof THREE.MeshDepthMaterial){D=1-p.__2near/
(p.__farPlusNear-y.z*p.__farMinusNear);u.setRGB(D,D,D)}else p instanceof THREE.MeshNormalMaterial&&u.setRGB(c(y.normalWorld.x),c(y.normalWorld.y),c(y.normalWorld.z));p.wireframe?E.setAttribute("style","fill: none; stroke: "+u.getContextStyle()+"; stroke-width: "+p.wireframeLinewidth+"; stroke-opacity: "+p.opacity+"; stroke-linecap: "+p.wireframeLinecap+"; stroke-linejoin: "+p.wireframeLinejoin):E.setAttribute("style","fill: "+u.getContextStyle()+"; fill-opacity: "+p.opacity);k.appendChild(E)}}}}}};
THREE.RenderableVertex=function(){this.positionWorld=new THREE.Vector3;this.positionScreen=new THREE.Vector4;this.visible=true};THREE.RenderableVertex.prototype.copy=function(a){this.positionWorld.copy(a.positionWorld);this.positionScreen.copy(a.positionScreen)};
THREE.RenderableFace3=function(){this.v1=new THREE.RenderableVertex;this.v2=new THREE.RenderableVertex;this.v3=new THREE.RenderableVertex;this.centroidWorld=new THREE.Vector3;this.centroidScreen=new THREE.Vector3;this.normalWorld=new THREE.Vector3;this.vertexNormalsWorld=[new THREE.Vector3,new THREE.Vector3,new THREE.Vector3];this.faceMaterial=this.material=null;this.uvs=[[]];this.z=null};
THREE.RenderableFace4=function(){this.v1=new THREE.RenderableVertex;this.v2=new THREE.RenderableVertex;this.v3=new THREE.RenderableVertex;this.v4=new THREE.RenderableVertex;this.centroidWorld=new THREE.Vector3;this.centroidScreen=new THREE.Vector3;this.normalWorld=new THREE.Vector3;this.vertexNormalsWorld=[new THREE.Vector3,new THREE.Vector3,new THREE.Vector3,new THREE.Vector3];this.faceMaterial=this.material=null;this.uvs=[[]];this.z=null};THREE.RenderableObject=function(){this.z=this.object=null};
THREE.RenderableParticle=function(){this.rotation=this.z=this.y=this.x=null;this.scale=new THREE.Vector2;this.material=null};THREE.RenderableLine=function(){this.z=null;this.v1=new THREE.RenderableVertex;this.v2=new THREE.RenderableVertex;this.material=null};
>>>>>>> dev
