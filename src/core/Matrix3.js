/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Matrix3 = function () {

	this.m = [];

};

THREE.Matrix3.prototype = {

	constructor: THREE.Matrix3,

	getInverse: function ( matrix ) {

		// input: THREE.Matrix4
		// ( based on http://code.google.com/p/webgl-mjs/ )

		var a11 =   matrix.n33 * matrix.n22 - matrix.n32 * matrix.n23;
		var a21 = - matrix.n33 * matrix.n21 + matrix.n31 * matrix.n23;
		var a31 =   matrix.n32 * matrix.n21 - matrix.n31 * matrix.n22;
		var a12 = - matrix.n33 * matrix.n12 + matrix.n32 * matrix.n13;
		var a22 =   matrix.n33 * matrix.n11 - matrix.n31 * matrix.n13;
		var a32 = - matrix.n32 * matrix.n11 + matrix.n31 * matrix.n12;
		var a13 =   matrix.n23 * matrix.n12 - matrix.n22 * matrix.n13;
		var a23 = - matrix.n23 * matrix.n11 + matrix.n21 * matrix.n13;
		var a33 =   matrix.n22 * matrix.n11 - matrix.n21 * matrix.n12;

		var det = matrix.n11 * a11 + matrix.n21 * a12 + matrix.n31 * a13;

		// no inverse

		if ( det === 0 ) {

			console.warn( "Matrix3.getInverse(): determinant == 0" );

		}

		var idet = 1.0 / det;

		var m = this.m;

		m[ 0 ] = idet * a11; m[ 1 ] = idet * a21; m[ 2 ] = idet * a31;
		m[ 3 ] = idet * a12; m[ 4 ] = idet * a22; m[ 5 ] = idet * a32;
		m[ 6 ] = idet * a13; m[ 7 ] = idet * a23; m[ 8 ] = idet * a33;

		return this;

	},

	/*
	transpose: function () {

		var tmp, m = this.m;

		tmp = m[1]; m[1] = m[3]; m[3] = tmp;
		tmp = m[2]; m[2] = m[6]; m[6] = tmp;
		tmp = m[5]; m[5] = m[7]; m[7] = tmp;

		return this;

	},
	*/

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
