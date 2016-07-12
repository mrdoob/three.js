/**
 * @author bhouston / http://exocortex.com
 */

module( "Matrix4" );

var matrixEquals4 = function( a, b, tolerance ) {
	tolerance = tolerance || 0.0001;
	if( a.elements.length != b.elements.length ) {
		return false;
	}
	for( var i = 0, il = a.elements.length; i < il; i ++ ) {
		var delta = a.elements[i] - b.elements[i];
		if( delta > tolerance ) {
			return false;
		}
	}
	return true;
};

test( "constructor", function() {
	var a = new THREE.Matrix4();
	ok( a.determinant() == 1, "Passed!" );

	var b = new THREE.Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	ok( b.elements[0] == 0 );
	ok( b.elements[1] == 4 );
	ok( b.elements[2] == 8 );
	ok( b.elements[3] == 12 );
	ok( b.elements[4] == 1 );
	ok( b.elements[5] == 5 );
	ok( b.elements[6] == 9 );
	ok( b.elements[7] == 13 );
	ok( b.elements[8] == 2 );
	ok( b.elements[9] == 6 );
	ok( b.elements[10] == 10 );
	ok( b.elements[11] == 14 );
	ok( b.elements[12] == 3 );
	ok( b.elements[13] == 7 );
	ok( b.elements[14] == 11 );
	ok( b.elements[15] == 15 );

	ok( ! matrixEquals4( a, b ), "Passed!" );
});

test( "copy", function() {
	var a = new THREE.Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	var b = new THREE.Matrix4().copy( a );

	ok( matrixEquals4( a, b ), "Passed!" );

	// ensure that it is a true copy
	a.elements[0] = 2;
	ok( ! matrixEquals4( a, b ), "Passed!" );
});

test( "set", function() {
	var b = new THREE.Matrix4();
	ok( b.determinant() == 1, "Passed!" );

	b.set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	ok( b.elements[0] == 0 );
	ok( b.elements[1] == 4 );
	ok( b.elements[2] == 8 );
	ok( b.elements[3] == 12 );
	ok( b.elements[4] == 1 );
	ok( b.elements[5] == 5 );
	ok( b.elements[6] == 9 );
	ok( b.elements[7] == 13 );
	ok( b.elements[8] == 2 );
	ok( b.elements[9] == 6 );
	ok( b.elements[10] == 10 );
	ok( b.elements[11] == 14 );
	ok( b.elements[12] == 3 );
	ok( b.elements[13] == 7 );
	ok( b.elements[14] == 11 );
	ok( b.elements[15] == 15 );
});

test( "identity", function() {
	var b = new THREE.Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	ok( b.elements[0] == 0 );
	ok( b.elements[1] == 4 );
	ok( b.elements[2] == 8 );
	ok( b.elements[3] == 12 );
	ok( b.elements[4] == 1 );
	ok( b.elements[5] == 5 );
	ok( b.elements[6] == 9 );
	ok( b.elements[7] == 13 );
	ok( b.elements[8] == 2 );
	ok( b.elements[9] == 6 );
	ok( b.elements[10] == 10 );
	ok( b.elements[11] == 14 );
	ok( b.elements[12] == 3 );
	ok( b.elements[13] == 7 );
	ok( b.elements[14] == 11 );
	ok( b.elements[15] == 15 );

	var a = new THREE.Matrix4();
	ok( ! matrixEquals4( a, b ), "Passed!" );

	b.identity();
	ok( matrixEquals4( a, b ), "Passed!" );
});

test( "multiplyScalar", function() {
	var b = new THREE.Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	ok( b.elements[0] == 0 );
	ok( b.elements[1] == 4 );
	ok( b.elements[2] == 8 );
	ok( b.elements[3] == 12 );
	ok( b.elements[4] == 1 );
	ok( b.elements[5] == 5 );
	ok( b.elements[6] == 9 );
	ok( b.elements[7] == 13 );
	ok( b.elements[8] == 2 );
	ok( b.elements[9] == 6 );
	ok( b.elements[10] == 10 );
	ok( b.elements[11] == 14 );
	ok( b.elements[12] == 3 );
	ok( b.elements[13] == 7 );
	ok( b.elements[14] == 11 );
	ok( b.elements[15] == 15 );

	b.multiplyScalar( 2 );
	ok( b.elements[0] == 0*2 );
	ok( b.elements[1] == 4*2 );
	ok( b.elements[2] == 8*2 );
	ok( b.elements[3] == 12*2 );
	ok( b.elements[4] == 1*2 );
	ok( b.elements[5] == 5*2 );
	ok( b.elements[6] == 9*2 );
	ok( b.elements[7] == 13*2 );
	ok( b.elements[8] == 2*2 );
	ok( b.elements[9] == 6*2 );
	ok( b.elements[10] == 10*2 );
	ok( b.elements[11] == 14*2 );
	ok( b.elements[12] == 3*2 );
	ok( b.elements[13] == 7*2 );
	ok( b.elements[14] == 11*2 );
	ok( b.elements[15] == 15*2 );
});

test( "determinant", function() {
	var a = new THREE.Matrix4();
	ok( a.determinant() == 1, "Passed!" );

	a.elements[0] = 2;
	ok( a.determinant() == 2, "Passed!" );

	a.elements[0] = 0;
	ok( a.determinant() == 0, "Passed!" );

	// calculated via http://www.euclideanspace.com/maths/algebra/matrix/functions/determinant/fourD/index.htm
	a.set( 2, 3, 4, 5, -1, -21, -3, -4, 6, 7, 8, 10, -8, -9, -10, -12 );
	ok( a.determinant() == 76, "Passed!" );
});

test( "getInverse", function() {
	var identity = new THREE.Matrix4();

	var a = new THREE.Matrix4();
	var b = new THREE.Matrix4().set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );
	var c = new THREE.Matrix4().set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

	ok( ! matrixEquals4( a, b ), "Passed!" );
	b.getInverse( a, false );
	ok( matrixEquals4( b, new THREE.Matrix4() ), "Passed!" );

	try {
		b.getInverse( c, true );
		ok( false, "Passed!" ); // should never get here.
	}
	catch( err ) {
		ok( true, "Passed!" );
	}

	var testMatrices = [
		new THREE.Matrix4().makeRotationX( 0.3 ),
		new THREE.Matrix4().makeRotationX( -0.3 ),
		new THREE.Matrix4().makeRotationY( 0.3 ),
		new THREE.Matrix4().makeRotationY( -0.3 ),
		new THREE.Matrix4().makeRotationZ( 0.3 ),
		new THREE.Matrix4().makeRotationZ( -0.3 ),
		new THREE.Matrix4().makeScale( 1, 2, 3 ),
		new THREE.Matrix4().makeScale( 1/8, 1/2, 1/3 ),
		new THREE.Matrix4().makeFrustum( -1, 1, -1, 1, 1, 1000 ),
		new THREE.Matrix4().makeFrustum( -16, 16, -9, 9, 0.1, 10000 ),
		new THREE.Matrix4().makeTranslation( 1, 2, 3 )
		];

	for( var i = 0, il = testMatrices.length; i < il; i ++ ) {
		var m = testMatrices[i];

		var mInverse = new THREE.Matrix4().getInverse( m );
		var mSelfInverse = m.clone();
		mSelfInverse.getInverse( mSelfInverse );


		// self-inverse should the same as inverse
		ok( matrixEquals4( mSelfInverse, mInverse ), "Passed!" );

		// the determinant of the inverse should be the reciprocal
		ok( Math.abs( m.determinant() * mInverse.determinant() - 1 ) < 0.0001, "Passed!" );

		var mProduct = new THREE.Matrix4().multiplyMatrices( m, mInverse );

		// the determinant of the identity matrix is 1
		ok( Math.abs( mProduct.determinant() - 1 ) < 0.0001, "Passed!" );
		ok( matrixEquals4( mProduct, identity ), "Passed!" );
	}
});

test( "makeBasis/extractBasis", function() {
	var identityBasis = [ new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 1 ) ];
	var a = new THREE.Matrix4().makeBasis( identityBasis[0], identityBasis[1], identityBasis[2] );
	var identity = new THREE.Matrix4();
	ok( matrixEquals4( a, identity ), "Passed!" );

	var testBases = [ [ new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( -1, 0, 0 ), new THREE.Vector3( 0, 0, 1 ) ] ]
	for( var i = 0; i < testBases.length; i ++ ) {
		var testBasis = testBases[i];
		var b = new THREE.Matrix4().makeBasis( testBasis[0], testBasis[1], testBasis[2] );
		var outBasis = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
		b.extractBasis( outBasis[0], outBasis[1], outBasis[2] );
		// check what goes in, is what comes out.
		for( var j = 0; j < outBasis.length; j ++ ) {
			ok( outBasis[j].equals( testBasis[j] ), "Passed!" );
		}

		// get the basis out the hard war
		for( var j = 0; j < identityBasis.length; j ++ ) {
			outBasis[j].copy( identityBasis[j] );
			outBasis[j].applyMatrix4( b );
		}
		// did the multiply method of basis extraction work?
		for( var j = 0; j < outBasis.length; j ++ ) {
			ok( outBasis[j].equals( testBasis[j] ), "Passed!" );
		}
	}
});

test( "transpose", function() {
	var a = new THREE.Matrix4();
	var b = a.clone().transpose();
	ok( matrixEquals4( a, b ), "Passed!" );

	b = new THREE.Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	var c = b.clone().transpose();
	ok( ! matrixEquals4( b, c ), "Passed!" );
	c.transpose();
	ok( matrixEquals4( b, c ), "Passed!" );
});

test( "clone", function() {
	var a = new THREE.Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	var b = a.clone();

	ok( matrixEquals4( a, b ), "Passed!" );

	// ensure that it is a true copy
	a.elements[0] = 2;
	ok( ! matrixEquals4( a, b ), "Passed!" );
});


test( "compose/decompose", function() {
	var tValues = [
		new THREE.Vector3(),
		new THREE.Vector3( 3, 0, 0 ),
		new THREE.Vector3( 0, 4, 0 ),
		new THREE.Vector3( 0, 0, 5 ),
		new THREE.Vector3( -6, 0, 0 ),
		new THREE.Vector3( 0, -7, 0 ),
		new THREE.Vector3( 0, 0, -8 ),
		new THREE.Vector3( -2, 5, -9 ),
		new THREE.Vector3( -2, -5, -9 )
	];

	var sValues = [
		new THREE.Vector3( 1, 1, 1 ),
		new THREE.Vector3( 2, 2, 2 ),
		new THREE.Vector3( 1, -1, 1 ),
		new THREE.Vector3( -1, 1, 1 ),
		new THREE.Vector3( 1, 1, -1 ),
		new THREE.Vector3( 2, -2, 1 ),
		new THREE.Vector3( -1, 2, -2 ),
		new THREE.Vector3( -1, -1, -1 ),
		new THREE.Vector3( -2, -2, -2 )
	];

	var rValues = [
		new THREE.Quaternion(),
		new THREE.Quaternion().setFromEuler( new THREE.Euler( 1, 1, 0 ) ),
		new THREE.Quaternion().setFromEuler( new THREE.Euler( 1, -1, 1 ) ),
		new THREE.Quaternion( 0, 0.9238795292366128, 0, 0.38268342717215614 )
	];


	for( var ti = 0; ti < tValues.length; ti ++ ) {
		for( var si = 0; si < sValues.length; si ++ ) {
			for( var ri = 0; ri < rValues.length; ri ++ ) {
				var t = tValues[ti];
				var s = sValues[si];
				var r = rValues[ri];

				var m = new THREE.Matrix4().compose( t, r, s );
				var t2 = new THREE.Vector3();
				var r2 = new THREE.Quaternion();
				var s2 = new THREE.Vector3();

				m.decompose( t2, r2, s2 );

				var m2 = new THREE.Matrix4().compose( t2, r2, s2 );

				var matrixIsSame = matrixEquals4( m, m2 );
				/* debug code
				if( ! matrixIsSame ) {
					console.log( t, s, r );
					console.log( t2, s2, r2 );
					console.log( m, m2 );
				}*/
				ok( matrixEquals4( m, m2 ), "Passed!" );

			}
		}
	}
});
