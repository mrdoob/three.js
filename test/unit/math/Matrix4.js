/**
 * @author bhouston / http://exocortex.com
 */

module( "Matrix4" );

var matrixEquals = function( a, b, tolerance ) {
	tolerance = tolerance || 0;
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

	var b = new THREE.Matrix4( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
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

	ok( ! matrixEquals( a, b ), "Passed!" );
});

test( "copy", function() {
	var a = new THREE.Matrix4( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	var b = new THREE.Matrix4().copy( a );

	ok( matrixEquals( a, b ), "Passed!" );

	// ensure that it is a true copy
	a.elements[0] = 2;
	ok( ! matrixEquals( a, b ), "Passed!" );
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
	var b = new THREE.Matrix4( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
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
	ok( ! matrixEquals( a, b ), "Passed!" );

	b.identity();
	ok( matrixEquals( a, b ), "Passed!" );
});

test( "multiplyScalar", function() {
	var b = new THREE.Matrix4( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
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
});

test( "getInverse", function() {
	var a = new THREE.Matrix4();
	var b = new THREE.Matrix4( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );
	var c = new THREE.Matrix4( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );
	
	ok( ! matrixEquals( a, b ), "Passed!" );
	b.getInverse( a, false );
	ok( matrixEquals( b, new THREE.Matrix4() ), "Passed!" );

	try { 
		b.getInverse( c, true );
		ok( false, "Passed!" ); // should never get here.
	}
	catch( err ) {
		ok( true, "Passed!" );
	}
});

test( "transpose", function() {
	var a = new THREE.Matrix4();
	var b = a.clone().transpose();
	ok( matrixEquals( a, b ), "Passed!" );

	b = new THREE.Matrix4( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	c = b.clone().transpose();
	ok( ! matrixEquals( b, c ), "Passed!" ); 
	c.transpose();
	ok( matrixEquals( b, c ), "Passed!" ); 
});

test( "clone", function() {
	var a = new THREE.Matrix4( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
	var b = a.clone();

	ok( matrixEquals( a, b ), "Passed!" );

	// ensure that it is a true copy
	a.elements[0] = 2;
	ok( ! matrixEquals( a, b ), "Passed!" );
});