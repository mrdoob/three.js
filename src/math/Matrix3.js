/**
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author bhouston / http://exocortex.com
 */

THREE.Matrix3 = function ( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

	this.elements = new Float32Array(9);

	this.set(

		( n11 !== undefined ) ? n11 : 1, n12 || 0, n13 || 0,
		n21 || 0, ( n22 !== undefined ) ? n22 : 1, n23 || 0,
		n31 || 0, n32 || 0, ( n33 !== undefined ) ? n33 : 1

	);
};

THREE.Matrix3.prototype = {

	constructor: THREE.Matrix3,

	set: function ( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

		var te = this.elements;

		te[0] = n11; te[3] = n12; te[6] = n13;
		te[1] = n21; te[4] = n22; te[7] = n23;
		te[2] = n31; te[5] = n32; te[8] = n33;

		return this;

	},

	identity: function () {

		this.set(

			1, 0, 0,
			0, 1, 0,
			0, 0, 1

		);

		return this;

	},

	copy: function ( m ) {

		var me = m.elements;

		this.set(

			me[0], me[3], me[6],
			me[1], me[4], me[7],
			me[2], me[5], me[8]

		);

		return this;

	},

	multiplyVector3: function ( vector ) {

		console.warn( 'DEPRECATED: Matrix3\'s .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead.' );
		return vector.applyMatrix3( this );

	},

	multiplyVector3Array: function() {

		var v1 = new THREE.Vector3();

		return function ( a ) {

			for ( var i = 0, il = a.length; i < il; i += 3 ) {

				v1.x = a[ i ];
				v1.y = a[ i + 1 ];
				v1.z = a[ i + 2 ];

				v1.applyMatrix3(this);

				a[ i ]     = v1.x;
				a[ i + 1 ] = v1.y;
				a[ i + 2 ] = v1.z;

			}

			return a;

		};

	}(),

	multiplyScalar: function ( s ) {

		var te = this.elements;

		te[0] *= s; te[3] *= s; te[6] *= s;
		te[1] *= s; te[4] *= s; te[7] *= s;
		te[2] *= s; te[5] *= s; te[8] *= s;

		return this;

	},

	determinant: function () {

		var te = this.elements;

		var a = te[0], b = te[1], c = te[2],
			d = te[3], e = te[4], f = te[5],
			g = te[6], h = te[7], i = te[8];

		return a*e*i - a*f*h - b*d*i + b*f*g + c*d*h - c*e*g;

	},

	getInverse: function ( matrix, throwOnInvertible ) {

		// input: THREE.Matrix4
		// ( based on http://code.google.com/p/webgl-mjs/ )

		var me = matrix.elements;
		var te = this.elements;

		te[ 0 ] =   me[10] * me[5] - me[6] * me[9];
		te[ 1 ] = - me[10] * me[1] + me[2] * me[9];
		te[ 2 ] =   me[6] * me[1] - me[2] * me[5];
		te[ 3 ] = - me[10] * me[4] + me[6] * me[8];
		te[ 4 ] =   me[10] * me[0] - me[2] * me[8];
		te[ 5 ] = - me[6] * me[0] + me[2] * me[4];
		te[ 6 ] =   me[9] * me[4] - me[5] * me[8];
		te[ 7 ] = - me[9] * me[0] + me[1] * me[8];
		te[ 8 ] =   me[5] * me[0] - me[1] * me[4];

		var det = me[ 0 ] * te[ 0 ] + me[ 1 ] * te[ 3 ] + me[ 2 ] * te[ 6 ];

		// no inverse

		if ( det === 0 ) {

			var msg = "Matrix3.getInverse(): can't invert matrix, determinant is 0";

			if ( throwOnInvertible || false ) {

				throw new Error( msg );

			} else {

				console.warn( msg );

			}

			this.identity();

			return this;

		}

		this.multiplyScalar( 1.0 / det );

		return this;

	},

	transpose: function () {

		var tmp, m = this.elements;

		tmp = m[1]; m[1] = m[3]; m[3] = tmp;
		tmp = m[2]; m[2] = m[6]; m[6] = tmp;
		tmp = m[5]; m[5] = m[7]; m[7] = tmp;

		return this;

	},

	getNormalMatrix: function ( m ) {

		// input: THREE.Matrix4

		this.getInverse( m ).transpose();

		return this;

	},

	transposeIntoArray: function ( r ) {

		var m = this.elements;

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

	},

	fromArray: function ( array ) {

		this.elements.set( array );

		return this;

	},

	toArray: function () {

		var te = this.elements;

		return [
			te[ 0 ], te[ 1 ], te[ 2 ],
			te[ 3 ], te[ 4 ], te[ 5 ],
			te[ 6 ], te[ 7 ], te[ 8 ]
		];

	},

	clone: function () {

		var te = this.elements;

		return new THREE.Matrix3(

			te[0], te[3], te[6],
			te[1], te[4], te[7],
			te[2], te[5], te[8]

		);

	}

};
