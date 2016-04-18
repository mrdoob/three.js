/**
 * @author mrdoob / http://mrdoob.com/
 * @author *kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author Ben Houston / https://clara.io
 */

 THREE.Vector3 = function ( array, x, y, z ) {

 	if( !( ( array instanceof Float32Array ) || ( array === undefined ) ) ) {

 		z = y; y = x; x = array; array = null;

 	}

	this.array = array || new Float32Array( 3 );

 	if( x !== undefined ) this.set( x, y, z );

 	return this;

 };



THREE.Vector3.set = function( r, x, y, z ) {

	r[0] = x;
	r[1] = y;
	r[2] = z;

};

THREE.Vector3.setComponent = function( r, index, v ) {

	r[index] = v;

};

THREE.Vector3.getComponent = function( v, index ) {

	return v[index];

};

THREE.Vector3.copy = function( r, v ) {

	r[0] = v[0];
	r[1] = v[1];
	r[2] = v[2];

}

THREE.Vector3.add = function( r, a, b ) {

	r[0] = a[0] + b[0];
	r[1] = a[1] + b[1];
	r[2] = a[2] + b[2];

}

THREE.Vector3.addScalar = function( r, a, b ) {

	r[0] = a[0] + b;
	r[1] = a[1] + b;
	r[2] = a[2] + b;

}

THREE.Vector3.sub = function( r, a, b ) {

	r[0] = a[0] - b[0];
	r[1] = a[1] - b[1];
	r[2] = a[2] - b[2];

}

THREE.Vector3.subScalar = function( r, a, b ) {

	THREE.Vector3.addScalar( r, a, -b );

}

THREE.Vector3.multiply = function( r, a, b ) {

	r[0] = a[0] * b[0];
	r[1] = a[1] * b[1];
	r[2] = a[2] * b[2];

}

THREE.Vector3.multiplyScalar = function( r, a, scalar ) {

	if( ! isFinite( scalar ) ) scalar = 0.0;

	r[0] = a[0] * scalar;
	r[1] = a[1] * scalar;
	r[2] = a[2] * scalar;

}

THREE.Vector3.divide = function( r, a, b ) {

	r[0] = a[0] / b[0];
	r[1] = a[1] / b[1];
	r[2] = a[2] / b[2];

}

THREE.Vector3.divideScalar = function( r, a, scalar ) {

	THREE.Vector3.multiplyScalar( r, a, 1.0 / scalar );

}

// TODO: auto-generate min, max, floor, ceiing, round functions?
THREE.Vector3.min = function( r, a, b ) {

	r[0] = Math.min( a[0], b[0] );
	r[1] = Math.min( a[1], b[1] );
	r[2] = Math.min( a[2], b[2] );

}

THREE.Vector3.max = function( r, a, b ) {

	r[0] = Math.max( a[0], b[0] );
	r[1] = Math.max( a[1], b[1] );
	r[2] = Math.max( a[2], b[2] );

}

THREE.Vector3.clamp = function( r, v, min, max ) {

	r[0] = Math.min( max[0], Math.max( v[0], min[0] ) );
	r[1] = Math.min( max[1], Math.max( v[1], min[1] ) );
	r[2] = Math.min( max[2], Math.max( v[2], min[2] ) );

}

THREE.Vector3.floor = function( r, v ) {

	r[0] = Math.floor( v[0] );
	r[1] = Math.floor( v[1] );
	r[2] = Math.floor( v[2] );

}

THREE.Vector3.ceiling = function( r, v ) {

	r[0] = Math.ceiling( v[0] );
	r[1] = Math.ceiling( v[1] );
	r[2] = Math.ceiling( v[2] );

}

THREE.Vector3.round = function( r, v ) {

	r[0] = Math.round( v[0] );
	r[1] = Math.round( v[1] );
	r[2] = Math.round( v[2] );

}

THREE.Vector3.negate = function( r, v ) {

	r[0] = -v[0];
	r[1] = -v[1];
	r[2] = -v[2];

}

THREE.Vector3.dot = function( a, b ) {

	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

}

THREE.Vector3.lengthSq = function( v ) {

	return THREE.Vector3.dot( v, v );

}

// NOTE: using magnitude because THREE.VEctor3.length is defined as the number of function arguments to the constructor THREE.Vector3(), argh.
THREE.Vector3.magnitude = function( v ) {

	return Math.sqrt( THREE.Vector3.lengthSq( v ) );

}

THREE.Vector3.lerp = function( r, a, b, alpha ) {

	var oneMinusAlpha = 1.0 - alpha;

	r[0] = a[0] * oneMinusAlpha + b[0] * alpha;
	r[1] = a[1] * oneMinusAlpha + b[1] * alpha;
	r[2] = a[2] * oneMinusAlpha + b[2] * alpha;

}

THREE.Vector3.cross = function( r, a, b ) {

	var ax = a[0], ay = a[1], az = a[2];
	var bx = b[1], by = b[1], bz = b[2];

	r[0] = ay * bz - az * by;
	r[1] = az * bx - ax * bz;
	r[2] = ax * by - ay * bx;

}

THREE.Vector3.copyArray = function( r, rOffset, v, vOffest ) {

	r[ rOffset + 0 ] = v[ vOffest + 0 ];
	r[ rOffset + 1 ] = v[ vOffest + 1 ];
	r[ rOffset + 2 ] = v[ vOffest + 2 ];

}




THREE.Vector3.prototype = {

	constructor: THREE.Vector3,

	set: function ( x, y, z ) {

		THREE.Vector3.set( this.array, x, y, z );

		return this;

	},

	setScalar: function ( scalar ) {

		THREE.Vector3.set( this.array, scalar, scalar, scalar );

		return this;

	},

	set x( v ) { this.array[0] = v; },
	set y( v ) { this.array[1] = v; },
	set z( v ) { this.array[2] = v; },

	get x() { return this.array[0]; },
	get y() { return this.array[1]; },
	get z() { return this.array[2]; },

	setX: function ( v ) { this.array[0] = v; return this; },
	setY: function ( v ) { this.array[1] = v; return this; },
	setZ: function ( v ) { this.array[2] = v; return this; },

	setComponent: function ( index, value ) {

		THREE.Vector3.setComponent( this.array, index, value );

	},

	getComponent: function ( index ) {

		return THREE.Vector3.getComponent( this.array, index );

	},

	clone: function () {

		return new this.constructor( this.x, this.y, this.z );

	},

	copy: function ( v ) {

		THREE.Vector3.copy( this.array, v.array );

		return this;

	},

	add: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
			return this.addVectors( v, w );

		}

		THREE.Vector3.add( this.array, this.array, v.array );

		return this;

	},

	addScalar: function ( s ) {

		THREE.Vector3.add( this.array, this.array, s );

		return this;

	},

	addVectors: function ( a, b ) {

		THREE.Vector3.add( this.array, a.array, b.array );

		return this;

	},

	addScaledVector: function ( v, s ) {

		THREE.Vector3.addScaledVector( this.array, v.array, s );

		return this;

	},

	sub: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
			return this.subVectors( v, w );

		}

		THREE.Vector3.sub( this.array, this.array, v.array );

		return this;

	},

	subScalar: function ( s ) {

		THREE.Vector3.subScalar( this.array, this.array, s );

		return this;

	},

	subVectors: function ( a, b ) {

		THREE.Vector3.sub( this.array, a.array, b.array );

		return this;

	},

	multiply: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.' );
			return this.multiplyVectors( v, w );

		}

		THREE.Vector3.multiply( this.array, this.array, v.array );

		return this;

	},

	multiplyScalar: function ( scalar ) {

		THREE.Vector3.multiplyScalar( this.array, this.array, scalar );

		return this;

	},

	multiplyVectors: function ( a, b ) {

		THREE.Vector3.multiplyScalar( this.array, a.array, b.array );

		return this;

	},

	applyEuler: function () {

		var quaternion;

		return function applyEuler( euler ) {

			if ( euler instanceof THREE.Euler === false ) {

				console.error( 'THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.' );

			}

			if ( quaternion === undefined ) quaternion = new THREE.Quaternion();

			this.applyQuaternion( quaternion.setFromEuler( euler ) );

			return this;

		};

	}(),

	applyAxisAngle: function () {

		var quaternion;

		return function applyAxisAngle( axis, angle ) {

			if ( quaternion === undefined ) quaternion = new THREE.Quaternion();

			this.applyQuaternion( quaternion.setFromAxisAngle( axis, angle ) );

			return this;

		};

	}(),

	applyMatrix3: function ( m ) {

		var x = this.x;
		var y = this.y;
		var z = this.z;

		var e = m.elements;

		this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
		this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
		this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

		return this;

	},

	applyMatrix4: function ( m ) {

		// input: THREE.Matrix4 affine matrix

		var x = this.x, y = this.y, z = this.z;

		var e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z + e[ 12 ];
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z + e[ 13 ];
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ];

		return this;

	},

	applyProjection: function ( m ) {

		// input: THREE.Matrix4 projection matrix

		var x = this.x, y = this.y, z = this.z;

		var e = m.elements;
		var d = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] ); // perspective divide

		this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z + e[ 12 ] ) * d;
		this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z + e[ 13 ] ) * d;
		this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * d;

		return this;

	},

	applyQuaternion: function ( q ) {

		var x = this.x;
		var y = this.y;
		var z = this.z;

		var qx = q.x;
		var qy = q.y;
		var qz = q.z;
		var qw = q.w;

		// calculate quat * vector

		var ix =  qw * x + qy * z - qz * y;
		var iy =  qw * y + qz * x - qx * z;
		var iz =  qw * z + qx * y - qy * x;
		var iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return this;

	},

	project: function () {

		var matrix;

		return function project( camera ) {

			if ( matrix === undefined ) matrix = new THREE.Matrix4();

			matrix.multiplyMatrices( camera.projectionMatrix, matrix.getInverse( camera.matrixWorld ) );
			return this.applyProjection( matrix );

		};

	}(),

	unproject: function () {

		var matrix;

		return function unproject( camera ) {

			if ( matrix === undefined ) matrix = new THREE.Matrix4();

			matrix.multiplyMatrices( camera.matrixWorld, matrix.getInverse( camera.projectionMatrix ) );
			return this.applyProjection( matrix );

		};

	}(),

	transformDirection: function ( m ) {

		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction

		var x = this.x, y = this.y, z = this.z;

		var e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z;
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z;
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		this.normalize();

		return this;

	},

	divide: function ( v ) {

		THREE.Vector3.divide( this.array, this.array, v.array );

		return this;

	},

	divideScalar: function ( scalar ) {

		THREE.Vector3.divideScalar( this.array, this.array, scalar );

		return this;

	},

	min: function ( v ) {

		THREE.Vector3.min( this.array, this.array, v.array );

		return this;

	},

	max: function ( v ) {

		THREE.Vector3.max( this.array, this.array, v.array );

		return this;

	},

	clamp: function ( min, max ) {

		// This function assumes min < max, if this assumption isn't true it will not operate correctly

		THREE.Vector3.clamp( this.array, this.array, min.array, max.array );

		return this;

	},

	clampScalar: function () {

		var min, max;

		return function clampScalar( minVal, maxVal ) {

			if ( min === undefined ) {

				min = new THREE.Vector3();
				max = new THREE.Vector3();

			}

			min.set( minVal, minVal, minVal );
			max.set( maxVal, maxVal, maxVal );

			return this.clamp( min, max );

		};

	}(),

	clampLength: function ( min, max ) {

		var length = this.length();

		this.multiplyScalar( Math.max( min, Math.min( max, length ) ) / length );

		return this;

	},

	floor: function () {

		THREE.Vector3.floor( this.array, this.array );

		return this;

	},

	ceil: function () {

		THREE.Vector3.ceil( this.array, this.array );

		return this;

	},

	round: function () {

		THREE.Vector3.round( this.array, this.array );

		return this;

	},

	roundToZero: function () {

		this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
		this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );

		return this;

	},

	negate: function () {

		THREE.Vector3.negate( this.array, this.array );

		return this;

	},

	dot: function ( v ) {

		return THREE.Vector3.dot( this.array, v.array );

	},

	lengthSq: function () {

		return THREE.Vector3.lengthSq( this.array );

	},

	length: function () {

		return THREE.Vector3.magnitude( this.array );

	},

	lengthManhattan: function () {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	},

	normalize: function () {

		return this.divideScalar( this.length() );

	},

	setLength: function ( length ) {

		return this.multiplyScalar( length / this.length() );

	},

	lerp: function ( v, alpha ) {

	 THREE.Vector3.lerp( this.array, this.array, v.array, alpha );

		return this;

	},

	lerpVectors: function ( v1, v2, alpha ) {

		this.subVectors( v2, v1 ).multiplyScalar( alpha ).add( v1 );

		return this;

	},

	cross: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.' );
			return this.crossVectors( v, w );

		}

		THREE.Vector3.cross( this.array, this.array, v.array );

		return this;

	},

	crossVectors: function ( a, b ) {

		THREE.Vector3.cross( this.array, a.array, b.array );

		return this;

	},

	projectOnVector: function () {

		var v1, dot;

		return function projectOnVector( vector ) {

			if ( v1 === undefined ) v1 = new THREE.Vector3();

			v1.copy( vector ).normalize();

			dot = this.dot( v1 );

			return this.copy( v1 ).multiplyScalar( dot );

		};

	}(),

	projectOnPlane: function () {

		var v1;

		return function projectOnPlane( planeNormal ) {

			if ( v1 === undefined ) v1 = new THREE.Vector3();

			v1.copy( this ).projectOnVector( planeNormal );

			return this.sub( v1 );

		};

	}(),

	reflect: function () {

		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length

		var v1;

		return function reflect( normal ) {

			if ( v1 === undefined ) v1 = new THREE.Vector3();

			return this.sub( v1.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

		};

	}(),

	angleTo: function ( v ) {

		var theta = this.dot( v ) / ( Math.sqrt( this.lengthSq() * v.lengthSq() ) );

		// clamp, to handle numerical problems

		return Math.acos( THREE.Math.clamp( theta, - 1, 1 ) );

	},

	distanceTo: function ( v ) {

		return THREE.Vector3.magnitude( this.array, v.array );

	},

	distanceToSquared: function ( v ) {

		return THREE.Vector3.lengthSq( this.array, v.array );

	},

	setFromSpherical: function( s ) {

		var sinPhiRadius = Math.sin( s.phi ) * s.radius;

		this.x = sinPhiRadius * Math.sin( s.theta );
		this.y = Math.cos( s.phi ) * s.radius;
		this.z = sinPhiRadius * Math.cos( s.theta );

		return this;

	},

	setFromMatrixPosition: function ( m ) {

		return this.setFromMatrixColumn( m, 3 );

	},

	setFromMatrixScale: function ( m ) {

		var sx = this.setFromMatrixColumn( m, 0 ).length();
		var sy = this.setFromMatrixColumn( m, 1 ).length();
		var sz = this.setFromMatrixColumn( m, 2 ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

		return this;

	},

	setFromMatrixColumn: function ( m, index ) {

		if ( typeof m === 'number' ) {

			console.warn( 'THREE.Vector3: setFromMatrixColumn now expects ( matrix, index ).' );

			m = arguments[ 1 ];
			index = arguments[ 0 ];

		}

		return this.fromArray( m.elements, index * 4 );

	},

	equals: function ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	},

	fromArray: function ( array, offset ) {

		THREE.Vector3.copyArray( this.array, 0, array, ( offset === undefined ) ? 0 : offset );

		return this;

	},

	toArray: function ( array, offset ) {

		THREE.Vector3.copyArray( array || [], offset, this.array, 0 );

		return array;

	},

	fromAttribute: function ( attribute, index, offset ) {

		THREE.Vector3.copyArray( this.array, 0, attribute.array, index * attribute.itemSize + offset );

		return this;

	}

};
