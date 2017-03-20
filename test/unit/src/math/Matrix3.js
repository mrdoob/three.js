/**
 * @author bhouston / http://exocortex.com
 */

QUnit.module( "Matrix3" );

var matrixEquals3 = function( a, b, tolerance ) {
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


var toMatrix4 = function( m3 ) {
	var result = new THREE.Matrix4();
	var re = result.elements;
	var me = m3.elements;
	re[0] = me[0];
	re[1] = me[1];
	re[2] = me[2];
	re[4] = me[3];
	re[5] = me[4];
	re[6] = me[5];
	re[8] = me[6];
	re[9] = me[7];
	re[10] = me[8];

	return result;
};

QUnit.test( "constructor" , function( assert ) {
	var a = new THREE.Matrix3();
	assert.ok( a.determinant() == 1, "Passed!" );

	var b = new THREE.Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
	assert.ok( b.elements[0] == 0 );
	assert.ok( b.elements[1] == 3 );
	assert.ok( b.elements[2] == 6 );
	assert.ok( b.elements[3] == 1 );
	assert.ok( b.elements[4] == 4 );
	assert.ok( b.elements[5] == 7 );
	assert.ok( b.elements[6] == 2 );
	assert.ok( b.elements[7] == 5 );
	assert.ok( b.elements[8] == 8 );

	assert.ok( ! matrixEquals3( a, b ), "Passed!" );
});

QUnit.test( "copy" , function( assert ) {
	var a = new THREE.Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
	var b = new THREE.Matrix3().copy( a );

	assert.ok( matrixEquals3( a, b ), "Passed!" );

	// ensure that it is a true copy
	a.elements[0] = 2;
	assert.ok( ! matrixEquals3( a, b ), "Passed!" );
});

QUnit.test( "set" , function( assert ) {
	var b = new THREE.Matrix3();
	assert.ok( b.determinant() == 1, "Passed!" );

	b.set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
	assert.ok( b.elements[0] == 0 );
	assert.ok( b.elements[1] == 3 );
	assert.ok( b.elements[2] == 6 );
	assert.ok( b.elements[3] == 1 );
	assert.ok( b.elements[4] == 4 );
	assert.ok( b.elements[5] == 7 );
	assert.ok( b.elements[6] == 2 );
	assert.ok( b.elements[7] == 5 );
	assert.ok( b.elements[8] == 8 );
});

QUnit.test( "identity" , function( assert ) {
	var b = new THREE.Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
	assert.ok( b.elements[0] == 0 );
	assert.ok( b.elements[1] == 3 );
	assert.ok( b.elements[2] == 6 );
	assert.ok( b.elements[3] == 1 );
	assert.ok( b.elements[4] == 4 );
	assert.ok( b.elements[5] == 7 );
	assert.ok( b.elements[6] == 2 );
	assert.ok( b.elements[7] == 5 );
	assert.ok( b.elements[8] == 8 );

	var a = new THREE.Matrix3();
	assert.ok( ! matrixEquals3( a, b ), "Passed!" );

	b.identity();
	assert.ok( matrixEquals3( a, b ), "Passed!" );
});

QUnit.test( "multiplyScalar" , function( assert ) {
	var b = new THREE.Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
	assert.ok( b.elements[0] == 0 );
	assert.ok( b.elements[1] == 3 );
	assert.ok( b.elements[2] == 6 );
	assert.ok( b.elements[3] == 1 );
	assert.ok( b.elements[4] == 4 );
	assert.ok( b.elements[5] == 7 );
	assert.ok( b.elements[6] == 2 );
	assert.ok( b.elements[7] == 5 );
	assert.ok( b.elements[8] == 8 );

	b.multiplyScalar( 2 );
	assert.ok( b.elements[0] == 0*2 );
	assert.ok( b.elements[1] == 3*2 );
	assert.ok( b.elements[2] == 6*2 );
	assert.ok( b.elements[3] == 1*2 );
	assert.ok( b.elements[4] == 4*2 );
	assert.ok( b.elements[5] == 7*2 );
	assert.ok( b.elements[6] == 2*2 );
	assert.ok( b.elements[7] == 5*2 );
	assert.ok( b.elements[8] == 8*2 );
});


QUnit.test( "determinant" , function( assert ) {
	var a = new THREE.Matrix3();
	assert.ok( a.determinant() == 1, "Passed!" );

	a.elements[0] = 2;
	assert.ok( a.determinant() == 2, "Passed!" );

	a.elements[0] = 0;
	assert.ok( a.determinant() == 0, "Passed!" );

	// calculated via http://www.euclideanspace.com/maths/algebra/matrix/functions/determinant/threeD/index.htm
	a.set( 2, 3, 4, 5, 13, 7, 8, 9, 11 );
	assert.ok( a.determinant() == -73, "Passed!" );
});


QUnit.test( "getInverse" , function( assert ) {
	var identity = new THREE.Matrix3();
	var identity4 = new THREE.Matrix4();
	var a = new THREE.Matrix3();
	var b = new THREE.Matrix3().set( 0, 0, 0, 0, 0, 0, 0, 0, 0 );
	var c = new THREE.Matrix3().set( 0, 0, 0, 0, 0, 0, 0, 0, 0 );

	b.getInverse( a, false );
	assert.ok( matrixEquals3( a, identity ), "Passed!" );

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
		new THREE.Matrix4().makeScale( 1/8, 1/2, 1/3 )
		];

	for( var i = 0, il = testMatrices.length; i < il; i ++ ) {
		var m = testMatrices[i];

		a.setFromMatrix4( m );
		var mInverse3 = b.getInverse( a );

		var mInverse = toMatrix4( mInverse3 );

		// the determinant of the inverse should be the reciprocal
		assert.ok( Math.abs( a.determinant() * mInverse3.determinant() - 1 ) < 0.0001, "Passed!" );
		assert.ok( Math.abs( m.determinant() * mInverse.determinant() - 1 ) < 0.0001, "Passed!" );

		var mProduct = new THREE.Matrix4().multiplyMatrices( m, mInverse );
		assert.ok( Math.abs( mProduct.determinant() - 1 ) < 0.0001, "Passed!" );
		assert.ok( matrixEquals3( mProduct, identity4 ), "Passed!" );
	}
});

QUnit.test( "transpose" , function( assert ) {
	var a = new THREE.Matrix3();
	var b = a.clone().transpose();
	assert.ok( matrixEquals3( a, b ), "Passed!" );

	b = new THREE.Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
	var c = b.clone().transpose();
	assert.ok( ! matrixEquals3( b, c ), "Passed!" ); 
	c.transpose();
	assert.ok( matrixEquals3( b, c ), "Passed!" ); 
});

QUnit.test( "clone" , function( assert ) {
	var a = new THREE.Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
	var b = a.clone();

	assert.ok( matrixEquals3( a, b ), "Passed!" );

	// ensure that it is a true copy
	a.elements[0] = 2;
	assert.ok( ! matrixEquals3( a, b ), "Passed!" );
});
