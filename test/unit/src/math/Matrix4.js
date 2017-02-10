/**
 * @author bhouston / http://exocortex.com
 */

QUnit.module( "Matrix4" );

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

QUnit.test( "constructor" , function( assert ) {
	var a = new THREE.Matrix4();
	assert.ok( a.determinant() == 1, "Passed!" );

	var b = new THREE.Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	assert.ok( b.elements[0] == 0 );
	assert.ok( b.elements[1] == 4 );
	assert.ok( b.elements[2] == 8 );
	assert.ok( b.elements[3] == 12 );
	assert.ok( b.elements[4] == 1 );
	assert.ok( b.elements[5] == 5 );
	assert.ok( b.elements[6] == 9 );
	assert.ok( b.elements[7] == 13 );
	assert.ok( b.elements[8] == 2 );
	assert.ok( b.elements[9] == 6 );
	assert.ok( b.elements[10] == 10 );
	assert.ok( b.elements[11] == 14 );
	assert.ok( b.elements[12] == 3 );
	assert.ok( b.elements[13] == 7 );
	assert.ok( b.elements[14] == 11 );
	assert.ok( b.elements[15] == 15 );

	assert.ok( ! matrixEquals4( a, b ), "Passed!" );
});

QUnit.test( "copy" , function( assert ) {
	var a = new THREE.Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	var b = new THREE.Matrix4().copy( a );

	assert.ok( matrixEquals4( a, b ), "Passed!" );

	// ensure that it is a true copy
	a.elements[0] = 2;
	assert.ok( ! matrixEquals4( a, b ), "Passed!" );
});

QUnit.test( "set" , function( assert ) {
	var b = new THREE.Matrix4();
	assert.ok( b.determinant() == 1, "Passed!" );

	b.set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	assert.ok( b.elements[0] == 0 );
	assert.ok( b.elements[1] == 4 );
	assert.ok( b.elements[2] == 8 );
	assert.ok( b.elements[3] == 12 );
	assert.ok( b.elements[4] == 1 );
	assert.ok( b.elements[5] == 5 );
	assert.ok( b.elements[6] == 9 );
	assert.ok( b.elements[7] == 13 );
	assert.ok( b.elements[8] == 2 );
	assert.ok( b.elements[9] == 6 );
	assert.ok( b.elements[10] == 10 );
	assert.ok( b.elements[11] == 14 );
	assert.ok( b.elements[12] == 3 );
	assert.ok( b.elements[13] == 7 );
	assert.ok( b.elements[14] == 11 );
	assert.ok( b.elements[15] == 15 );
});

QUnit.test( "identity" , function( assert ) {
	var b = new THREE.Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	assert.ok( b.elements[0] == 0 );
	assert.ok( b.elements[1] == 4 );
	assert.ok( b.elements[2] == 8 );
	assert.ok( b.elements[3] == 12 );
	assert.ok( b.elements[4] == 1 );
	assert.ok( b.elements[5] == 5 );
	assert.ok( b.elements[6] == 9 );
	assert.ok( b.elements[7] == 13 );
	assert.ok( b.elements[8] == 2 );
	assert.ok( b.elements[9] == 6 );
	assert.ok( b.elements[10] == 10 );
	assert.ok( b.elements[11] == 14 );
	assert.ok( b.elements[12] == 3 );
	assert.ok( b.elements[13] == 7 );
	assert.ok( b.elements[14] == 11 );
	assert.ok( b.elements[15] == 15 );

	var a = new THREE.Matrix4();
	assert.ok( ! matrixEquals4( a, b ), "Passed!" );

	b.identity();
	assert.ok( matrixEquals4( a, b ), "Passed!" );
});

QUnit.test( "multiplyScalar" , function( assert ) {
	var b = new THREE.Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	assert.ok( b.elements[0] == 0 );
	assert.ok( b.elements[1] == 4 );
	assert.ok( b.elements[2] == 8 );
	assert.ok( b.elements[3] == 12 );
	assert.ok( b.elements[4] == 1 );
	assert.ok( b.elements[5] == 5 );
	assert.ok( b.elements[6] == 9 );
	assert.ok( b.elements[7] == 13 );
	assert.ok( b.elements[8] == 2 );
	assert.ok( b.elements[9] == 6 );
	assert.ok( b.elements[10] == 10 );
	assert.ok( b.elements[11] == 14 );
	assert.ok( b.elements[12] == 3 );
	assert.ok( b.elements[13] == 7 );
	assert.ok( b.elements[14] == 11 );
	assert.ok( b.elements[15] == 15 );

	b.multiplyScalar( 2 );
	assert.ok( b.elements[0] == 0*2 );
	assert.ok( b.elements[1] == 4*2 );
	assert.ok( b.elements[2] == 8*2 );
	assert.ok( b.elements[3] == 12*2 );
	assert.ok( b.elements[4] == 1*2 );
	assert.ok( b.elements[5] == 5*2 );
	assert.ok( b.elements[6] == 9*2 );
	assert.ok( b.elements[7] == 13*2 );
	assert.ok( b.elements[8] == 2*2 );
	assert.ok( b.elements[9] == 6*2 );
	assert.ok( b.elements[10] == 10*2 );
	assert.ok( b.elements[11] == 14*2 );
	assert.ok( b.elements[12] == 3*2 );
	assert.ok( b.elements[13] == 7*2 );
	assert.ok( b.elements[14] == 11*2 );
	assert.ok( b.elements[15] == 15*2 );
});

QUnit.test( "determinant" , function( assert ) {
	var a = new THREE.Matrix4();
	assert.ok( a.determinant() == 1, "Passed!" );

	a.elements[0] = 2;
	assert.ok( a.determinant() == 2, "Passed!" );

	a.elements[0] = 0;
	assert.ok( a.determinant() == 0, "Passed!" );

	// calculated via http://www.euclideanspace.com/maths/algebra/matrix/functions/determinant/fourD/index.htm
	a.set( 2, 3, 4, 5, -1, -21, -3, -4, 6, 7, 8, 10, -8, -9, -10, -12 );
	assert.ok( a.determinant() == 76, "Passed!" );
});

QUnit.test( "getInverse" , function( assert ) {
	var identity = new THREE.Matrix4();

	var a = new THREE.Matrix4();
	var b = new THREE.Matrix4().set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );
	var c = new THREE.Matrix4().set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

	assert.ok( ! matrixEquals4( a, b ), "Passed!" );
	b.getInverse( a, false );
	assert.ok( matrixEquals4( b, new THREE.Matrix4() ), "Passed!" );

	try {
		b.getInverse( c, true );
		assert.ok( false, "Passed!" ); // should never get here.
	}
	catch( err ) {
		assert.ok( true, "Passed!" );
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
		new THREE.Matrix4().makePerspective( -1, 1, 1, -1, 1, 1000 ),
		new THREE.Matrix4().makePerspective( -16, 16, 9, -9, 0.1, 10000 ),
		new THREE.Matrix4().makeTranslation( 1, 2, 3 )
		];

	for( var i = 0, il = testMatrices.length; i < il; i ++ ) {
		var m = testMatrices[i];

		var mInverse = new THREE.Matrix4().getInverse( m );
		var mSelfInverse = m.clone();
		mSelfInverse.getInverse( mSelfInverse );


		// self-inverse should the same as inverse
		assert.ok( matrixEquals4( mSelfInverse, mInverse ), "Passed!" );

		// the determinant of the inverse should be the reciprocal
		assert.ok( Math.abs( m.determinant() * mInverse.determinant() - 1 ) < 0.0001, "Passed!" );

		var mProduct = new THREE.Matrix4().multiplyMatrices( m, mInverse );

		// the determinant of the identity matrix is 1
		assert.ok( Math.abs( mProduct.determinant() - 1 ) < 0.0001, "Passed!" );
		assert.ok( matrixEquals4( mProduct, identity ), "Passed!" );
	}
});

QUnit.test( "makeBasis/extractBasis", function( assert ) {
	var identityBasis = [ new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 1 ) ];
	var a = new THREE.Matrix4().makeBasis( identityBasis[0], identityBasis[1], identityBasis[2] );
	var identity = new THREE.Matrix4();
	assert.ok( matrixEquals4( a, identity ), "Passed!" );

	var testBases = [ [ new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( -1, 0, 0 ), new THREE.Vector3( 0, 0, 1 ) ] ];
	for( var i = 0; i < testBases.length; i ++ ) {
		var testBasis = testBases[i];
		var b = new THREE.Matrix4().makeBasis( testBasis[0], testBasis[1], testBasis[2] );
		var outBasis = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
		b.extractBasis( outBasis[0], outBasis[1], outBasis[2] );
		// check what goes in, is what comes out.
		for( var j = 0; j < outBasis.length; j ++ ) {
			assert.ok( outBasis[j].equals( testBasis[j] ), "Passed!" );
		}

		// get the basis out the hard war
		for( var j = 0; j < identityBasis.length; j ++ ) {
			outBasis[j].copy( identityBasis[j] );
			outBasis[j].applyMatrix4( b );
		}
		// did the multiply method of basis extraction work?
		for( var j = 0; j < outBasis.length; j ++ ) {
			assert.ok( outBasis[j].equals( testBasis[j] ), "Passed!" );
		}
	}
});

QUnit.test( "transpose" , function( assert ) {
	var a = new THREE.Matrix4();
	var b = a.clone().transpose();
	assert.ok( matrixEquals4( a, b ), "Passed!" );

	b = new THREE.Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	var c = b.clone().transpose();
	assert.ok( ! matrixEquals4( b, c ), "Passed!" );
	c.transpose();
	assert.ok( matrixEquals4( b, c ), "Passed!" );
});

QUnit.test( "clone" , function( assert ) {
	var a = new THREE.Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	var b = a.clone();

	assert.ok( matrixEquals4( a, b ), "Passed!" );

	// ensure that it is a true copy
	a.elements[0] = 2;
	assert.ok( ! matrixEquals4( a, b ), "Passed!" );
});


QUnit.test( "compose/decompose", function( assert ) {
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
				assert.ok( matrixEquals4( m, m2 ), "Passed!" );

			}
		}
	}
});
