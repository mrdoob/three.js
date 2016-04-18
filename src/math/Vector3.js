/**
 * @author mrdoob / http://mrdoob.com/
 * @author *kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author Ben Houston / https://clara.io
 */

THREE.Vector3 = function ( x, y, z ) {

	this.offset = THREE.BlockAllocator.getFloat32( 3 );
	this.array = THREE.BlockAllocator.currentBuffer;

	if( x !== undefined ) THREE.Vector3.set( this.array, this.offset, x, y, z );
};


Object.assign( THREE.Vector3, {

	set: function( r, ro, x, y, z ) {

		r[ro+0] = x;
		r[ro+1] = y;
		r[ro+2] = z;

	},

	setComponent: function( r, ro, index, v ) {

		r[ro+index] = v;

	},

	getComponent: function( v, vo, index ) {

		return v[vo+index];

	},

	copy: function( r, ro, v, vo ) {

		r[ro+0] = v[vo+0];
		r[ro+1] = v[vo+1];
		r[ro+2] = v[vo+2];

	},

	add: function( r, ro, a, ao, b, bo ) {

		r[ro+0] = a[ao+0] + b[bo+0];
		r[ro+1] = a[ao+1] + b[bo+1];
		r[ro+2] = a[ao+2] + b[bo+2];

	},

	addScalar: function( r, ro, a, ao, s ) {

		r[ro+0] = a[ao+0] + s;
		r[ro+1] = a[ao+1] + s;
		r[ro+2] = a[ao+2] + s;

	},

	addScaledVector: function( r, ro, a, ao, b, bo, scale ) {

		r[ro+0] = a[ao+0] + Math.fround( b[bo+0] * scale );
		r[ro+1] = a[ao+1] + Math.fround( b[bo+1] * scale );
		r[ro+2] = a[ao+2] + Math.fround( b[bo+2] * scale );

	},

	sub: function( r, ro, a, ao, b, bo ) {

		r[ro+0] = a[ao+0] - b[bo+0];
		r[ro+1] = a[ao+1] - b[bo+1];
		r[ro+2] = a[ao+2] - b[bo+2];

	},

	subSelf: function( r, ro, v, vo ) {

		r[ro+0] -= v[vo+0];
		r[ro+1] -= v[vo+1];
		r[ro+2] -= v[vo+2];

	},

	subScalar: function( r, ro, v, vo, s ) {

		THREE.Vector3.addScalar( r, ro, v, vo, -s );

	},

	multiply: function( r, ro, a, ao, b, bo ) {

		r[ro+0] = a[ao+0] * b[bo+0];
		r[ro+1] = a[ao+1] * b[bo+1];
		r[ro+2] = a[ao+2] * b[bo+2];

	},


	multiplyScalar: function( r, ro, a, ao, s ) {

		r[ro+0] = a[ao+0] * s;
		r[ro+1] = a[ao+1] * s;
		r[ro+2] = a[ao+2] * s;

	},

	divide: function( r, ro, a, ao, b, bo ) {

		r[ro+0] = a[ao+0] / b[bo+0];
		r[ro+1] = a[ao+1] / b[bo+1];
		r[ro+2] = a[ao+2] / b[bo+2];

	},

	divideScalar: function( r, ro, a, ao, s ) {

		s = 1.0 / s;

		if( ! isFinite( s ) ) s = 0;

		THREE.Vector3.multiplyScalar( r, ro, a, ao, s );

	},

	// TODO: auto-generate min, max, floor, ceiing, round functions?
	min: function( r, ro, a, ao, b, bo ) {

		r[ro+0] = Math.min( a[ao+0], b[bo+0] );
		r[ro+1] = Math.min( a[ao+1], b[bo+1] );
		r[ro+2] = Math.min( a[ao+2], b[bo+2] );

	},

	max: function( r, ro, a, ao, b, bo ) {

		r[ro+0] = Math.max( a[ao+0], b[bo+0] );
		r[ro+1] = Math.max( a[ao+1], b[bo+1] );
		r[ro+2] = Math.max( a[ao+2], b[bo+2] );

	},

	clamp: function( r, ro, v, vo, min, no, max, xo ) {

		r[ro+0] = Math.min( max[xo+0], Math.max( v[vo+0], min[no+0] ) );
		r[ro+1] = Math.min( max[xo+1], Math.max( v[vo+1], min[no+1] ) );
		r[ro+2] = Math.min( max[xo+2], Math.max( v[vo+2], min[no+2] ) );

	},

	floor: function( r, ro, v, vo ) {

		r[ro+0] = Math.floor( v[vo+0] );
		r[ro+1] = Math.floor( v[vo+1] );
		r[ro+2] = Math.floor( v[vo+2] );

	},

	ceil: function( r, ro, v, vo ) {

		r[ro+0] = Math.ceil( v[vo+0] );
		r[ro+1] = Math.ceil( v[vo+1] );
		r[ro+2] = Math.ceil( v[vo+2] );

	},

	round: function( r, ro, v, vo ) {

		r[ro+0] = Math.round( v[vo+0] );
		r[ro+1] = Math.round( v[vo+1] );
		r[ro+2] = Math.round( v[vo+2] );

	},

	negate: function( r, ro, v, vo ) {

		r[ro+0] = -v[vo+0];
		r[ro+1] = -v[vo+1];
		r[ro+2] = -v[vo+2];

	},

	dot: function( a, ao, b, bo ) {

		return Math.fround( a[ao+0] * b[bo+0] + a[ao+1] * b[bo+1] + a[ao+2] * b[bo+2] );

	},

	lengthSq: function( v, vo ) {

		var x = v[vo+0], y = v[vo+1], z = v[vo+2];
		return Math.fround( x*x + y*y + z*z );

	},

	// NOTE: using magnitude because THREE.VEctor3.length is defined as the number of function arguments to the constructor THREE.Vector3(), argh.
	magnitude: function( v, vo ) {

		var x = v[vo+0], y = v[vo+1], z = v[vo+2];
		return Math.sqrt( Math.fround( x*x + y*y + z*z ) );

	},

	lerp: function( r, ro, a, ao, b, bo, alpha ) {

		var oneMinusAlpha = 1.0 - alpha;

		r[ro+0] = Math.fround( a[ao+0] * oneMinusAlpha ) + Math.fround( b[bo+0] * alpha );
		r[ro+1] = Math.fround( a[ao+1] * oneMinusAlpha ) + Math.fround( b[bo+1] * alpha );
		r[ro+2] = Math.fround( a[ao+2] * oneMinusAlpha ) + Math.fround( b[bo+2] * alpha );

	},

	cross: function( r, ro, a, ao, b, bo ) {

		var ax = a[ao+0], ay = a[ao+1], az = a[ao+2];
		var bx = b[bo+0], by = b[bo+1], bz = b[bo+2];

		r[ro+0] = ay * bz - az * by;
		r[ro+1] = az * bx - ax * bz;
		r[ro+2] = ax * by - ay * bx;

	},

	normalize: function( r, ro, v, vo ) {

		var x = v[vo+0], y = v[vo+1], z = v[vo+2];
		var scalar = 1.0 / Math.sqrt( x*x + y*y + z*z );
		if( ! isFinite( scalar ) ) scalar = 0.0;

		r[ro+0] = v[vo+0] * scalar;
		r[ro+1] = v[vo+1] * scalar;
		r[ro+2] = v[vo+2] * scalar;

		return this;

	},

	distance: function( a, ao, b, bo ) {

		var x = b[bo+0] - a[ao+0], y = b[bo+1] - a[ao+1], z = b[bo+2] - a[ao+2];
		return Math.sqrt( x*x + y*y + z*z );

	},

	distanceSq: function( a, ao, b, bo ) {

		var x = b[bo+0] - a[ao+0], y = b[bo+1] - a[ao+1], z = b[bo+2] - a[ao+2];
		return x*x + y*y + z*z;

	},

});

THREE.Vector3.prototype = {

	constructor: THREE.Vector3,

	set: function ( x, y, z ) {

		THREE.Vector3.set( this.array, this.offset, x, y, z );

		return this;

	},

	setScalar: function ( scalar ) {

		THREE.Vector3.set( this.array, this.offset, scalar, scalar, scalar );

		return this;

	},

	set x( v ) { this.array[this.offset+0] = v; },
	set y( v ) { this.array[this.offset+1] = v; },
	set z( v ) { this.array[this.offset+2] = v; },

	get x() { return this.array[this.offset+0]; },
	get y() { return this.array[this.offset+1]; },
	get z() { return this.array[this.offset+2]; },

	setX: function ( v ) { this.array[this.offset+0] = v; return this; },
	setY: function ( v ) { this.array[this.offset+1] = v; return this; },
	setZ: function ( v ) { this.array[this.offset+2] = v; return this; },

	setComponent: function ( index, value ) {

		THREE.Vector3.setComponent( this.array, this.offset, index, value );

	},

	getComponent: function ( index ) {

		return THREE.Vector3.getComponent( this.array, this.offset, index );

	},

	clone: function () {

		return new this.constructor( this.x, this.y, this.z );

	},

	copy: function ( v ) {

		THREE.Vector3.copy( this.array, this.offset, v.array, v.offset );

		return this;

	},

	add: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
			return this.addVectors( v, w );

		}

		THREE.Vector3.add( this.array, this.offset, this.array, this.offset, v.array, v.offset );

		return this;

	},

	addScalar: function ( s ) {

		THREE.Vector3.add( this.array, this.offset, this.array, this.offset, s );

		return this;

	},

	addVectors: function ( a, b ) {

		THREE.Vector3.add( this.array, this.offset, a.array, a.offset, b.array, b.offset );

		return this;

	},

	addScaledVector: function ( v, s ) {

		THREE.Vector3.addScaledVector( this.array, this.offset, this.array, this.offset, v.array, v.offset, s );

		return this;

	},

	sub: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
			return this.subVectors( v, w );

		}

		THREE.Vector3.sub( this.array, this.offset, this.array, this.offset, v.array, v.offset );

		return this;

	},

	subScalar: function ( s ) {

		THREE.Vector3.subScalar( this.array, this.offset, this.array, this.offset, s );

		return this;

	},

	subVectors: function ( a, b ) {

		THREE.Vector3.sub( this.array, this.offset, a.array, a.offset, b.array, b.offset );

		return this;

	},

	multiply: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.' );
			return this.multiplyVectors( v, w );

		}

		THREE.Vector3.multiply( this.array, this.offset, this.array, this.offset, v.array, v.offset );

		return this;

	},

	multiplyScalar: function ( scalar ) {

		THREE.Vector3.multiplyScalar( this.array, this.offset, this.array, this.offset, scalar );

		return this;

	},

	multiplyVectors: function ( a, b ) {

		THREE.Vector3.multiplyScalar( this.array, this.offset, a.array, a.offset, b.array, b.offset );

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

		THREE.Vector3.divide( this.array, this.offset, this.array, this.offset, v.array, v.offset );

		return this;

	},

	divideScalar: function ( scalar ) {

		THREE.Vector3.divideScalar( this.array, this.offset, this.array, this.offset, scalar );

		return this;

	},

	min: function ( v ) {

		THREE.Vector3.min( this.array, this.offset, this.array, this.offset, v.array, v.offset );

		return this;

	},

	max: function ( v ) {

		THREE.Vector3.max( this.array, this.offset, this.array, this.offset, v.array, v.offset );

		return this;

	},

	clamp: function ( min, max ) {

		// This function assumes min < max, if this assumption isn't true it will not operate correctly

		THREE.Vector3.clamp( this.array, this.offset, this.array, this.offset, min.array, min.offset, max.array, max.offset );

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

		THREE.Vector3.floor( this.array, this.offset, this.array, this.offset );

		return this;

	},

	ceil: function () {

		THREE.Vector3.ceil( this.array, this.offset, this.array, this.offset );

		return this;

	},

	round: function () {

		THREE.Vector3.round( this.array, this.offset, this.array, this.offset );

		return this;

	},

	roundToZero: function () {

		this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
		this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );

		return this;

	},

	negate: function () {

		THREE.Vector3.negate( this.array, this.offset, this.array, this.offset );

		return this;

	},

	dot: function ( v ) {

		return THREE.Vector3.dot( this.array, this.offset, v.array, v.offset );

	},

	lengthSq: function () {

		return THREE.Vector3.lengthSq( this.array, this.offset );

	},

	length: function () {

		return THREE.Vector3.magnitude( this.array, this.offset );

	},

	lengthManhattan: function () {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	},

	normalize: function () {

		THREE.Vector3.normalize( this.array, this.offset, this.array, this.offset );

		return this;

	},

	setLength: function ( length ) {

		return this.multiplyScalar( length / this.length() );

	},

	lerp: function ( v, alpha ) {

	 THREE.Vector3.lerp( this.array, this.offset, this.array, this.offset, v.array, v.offset, alpha );

		return this;

	},

	lerpVectors: function ( v1, v2, alpha ) {

		THREE.Vector3.lerp( this.array, this.offset, v1.array, v1.offset, v2.array, v2.offset, alpha );

		return this;

	},

	cross: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.' );
			return this.crossVectors( v, w );

		}

		THREE.Vector3.cross( this.array, this.offset, this.array, this.offset, v.array, v.offset );

		return this;

	},

	crossVectors: function ( a, b ) {

		THREE.Vector3.cross( this.array, this.offset, a.array, a.offset, b.array, b.offset );

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

		return THREE.Vector3.distance( this.array, this.offset, v.array, v.offset );

	},

	distanceToSquared: function ( v ) {

		return THREE.Vector3.distanceSq( this.array, this.offset, v.array, v.offset );

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

		THREE.Vector3.copy( this.array, this.offset, array, ( offset === undefined ) ? 0 : offset );

		return this;

	},

	toArray: function ( array, offset ) {

		THREE.Vector3.copy( array || [], offset, this.array, this.offset );

		return array;

	},

	fromAttribute: function ( attribute, index, offset ) {

		THREE.Vector3.copy( this.array, this.offset, attribute.array, index * attribute.itemSize + offset );

		return this;

	}

};
