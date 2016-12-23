/**
 * @author bhouston / http://exocortex.com
 * @author tschw
 */

module( "Quaternion" );

var orders = [ 'XYZ', 'YXZ', 'ZXY', 'ZYX', 'YZX', 'XZY' ];
var eulerAngles = new THREE.Euler( 0.1, -0.3, 0.25 );



var qSub = function ( a, b ) {
	var result = new THREE.Quaternion();
	result.copy( a );

	result.x -= b.x;
	result.y -= b.y;
	result.z -= b.z;
	result.w -= b.w;

	return result;

};

test( "constructor", function() {
	var a = new THREE.Quaternion();
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );
	ok( a.z == 0, "Passed!" );
	ok( a.w == 1, "Passed!" );

	a = new THREE.Quaternion( x, y, z, w );
	ok( a.x === x, "Passed!" );
	ok( a.y === y, "Passed!" );
	ok( a.z === z, "Passed!" );
	ok( a.w === w, "Passed!" );
});

test( "copy", function() {
	var a = new THREE.Quaternion( x, y, z, w );
	var b = new THREE.Quaternion().copy( a );
	ok( b.x == x, "Passed!" );
	ok( b.y == y, "Passed!" );
	ok( b.z == z, "Passed!" );
	ok( b.w == w, "Passed!" );

	// ensure that it is a true copy
	a.x = 0;
	a.y = -1;
	a.z = 0;
	a.w = -1;
	ok( b.x == x, "Passed!" );
	ok( b.y == y, "Passed!" );
});

test( "set", function() {
	var a = new THREE.Quaternion();
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );
	ok( a.z == 0, "Passed!" );
	ok( a.w == 1, "Passed!" );

	a.set( x, y, z, w );
	ok( a.x == x, "Passed!" );
	ok( a.y == y, "Passed!" );
	ok( a.z === z, "Passed!" );
	ok( a.w === w, "Passed!" );
});

test( "setFromAxisAngle", function() {

	// TODO: find cases to validate.
	ok( true, "Passed!" );

	var zero = new THREE.Quaternion();

	var a = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), 0 );
	ok( a.equals( zero ), "Passed!" );
	a = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), 0 );
	ok( a.equals( zero ), "Passed!" );
	a = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), 0 );
	ok( a.equals( zero ), "Passed!" );

	var b1 = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), Math.PI );
	ok( ! a.equals( b1 ), "Passed!" );
	var b2 = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI );
	ok( ! a.equals( b2 ), "Passed!" );

	b1.multiply( b2 );
	ok( a.equals( b1 ), "Passed!" );
});


test( "setFromEuler/setFromQuaternion", function() {

	var angles = [ new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 1 ) ];

	// ensure euler conversion to/from Quaternion matches.
	for( var i = 0; i < orders.length; i ++ ) {
		for( var j = 0; j < angles.length; j ++ ) {
			var eulers2 = new THREE.Euler().setFromQuaternion( new THREE.Quaternion().setFromEuler( new THREE.Euler( angles[j].x, angles[j].y, angles[j].z, orders[i] ) ), orders[i] );
			var newAngle = new THREE.Vector3( eulers2.x, eulers2.y, eulers2.z );
			ok( newAngle.distanceTo( angles[j] ) < 0.001, "Passed!" );
		}
	}

});

test( "setFromEuler/setFromRotationMatrix", function() {

	// ensure euler conversion for Quaternion matches that of Matrix4
	for( var i = 0; i < orders.length; i ++ ) {
		var q = new THREE.Quaternion().setFromEuler( eulerAngles, orders[i] );
		var m = new THREE.Matrix4().makeRotationFromEuler( eulerAngles, orders[i] );
		var q2 = new THREE.Quaternion().setFromRotationMatrix( m );

		ok( qSub( q, q2 ).length() < 0.001, "Passed!" );
	}

});

test( "normalize/length/lengthSq", function() {
	var a = new THREE.Quaternion( x, y, z, w );
	var b = new THREE.Quaternion( -x, -y, -z, -w );

	ok( a.length() != 1, "Passed!");
	ok( a.lengthSq() != 1, "Passed!");
	a.normalize();
	ok( a.length() == 1, "Passed!");
	ok( a.lengthSq() == 1, "Passed!");

	a.set( 0, 0, 0, 0 );
	ok( a.lengthSq() == 0, "Passed!");
	ok( a.length() == 0, "Passed!");
	a.normalize();
	ok( a.lengthSq() == 1, "Passed!");
	ok( a.length() == 1, "Passed!");
});

test( "inverse/conjugate", function() {
	var a = new THREE.Quaternion( x, y, z, w );

	// TODO: add better validation here.

	var b = a.clone().conjugate();

	ok( a.x == -b.x, "Passed!" );
	ok( a.y == -b.y, "Passed!" );
	ok( a.z == -b.z, "Passed!" );
	ok( a.w == b.w, "Passed!" );
});


test( "multiplyQuaternions/multiply", function() {

	var angles = [ new THREE.Euler( 1, 0, 0 ), new THREE.Euler( 0, 1, 0 ), new THREE.Euler( 0, 0, 1 ) ];

	var q1 = new THREE.Quaternion().setFromEuler( angles[0], "XYZ" );
	var q2 = new THREE.Quaternion().setFromEuler( angles[1], "XYZ" );
	var q3 = new THREE.Quaternion().setFromEuler( angles[2], "XYZ" );

	var q = new THREE.Quaternion().multiplyQuaternions( q1, q2 ).multiply( q3 );

	var m1 = new THREE.Matrix4().makeRotationFromEuler( angles[0], "XYZ" );
	var m2 = new THREE.Matrix4().makeRotationFromEuler( angles[1], "XYZ" );
	var m3 = new THREE.Matrix4().makeRotationFromEuler( angles[2], "XYZ" );

	var m = new THREE.Matrix4().multiplyMatrices( m1, m2 ).multiply( m3 );

	var qFromM = new THREE.Quaternion().setFromRotationMatrix( m );

	ok( qSub( q, qFromM ).length() < 0.001, "Passed!" );
});

test( "multiplyVector3", function() {

	var angles = [ new THREE.Euler( 1, 0, 0 ), new THREE.Euler( 0, 1, 0 ), new THREE.Euler( 0, 0, 1 ) ];

	// ensure euler conversion for Quaternion matches that of Matrix4
	for( var i = 0; i < orders.length; i ++ ) {
		for( var j = 0; j < angles.length; j ++ ) {
			var q = new THREE.Quaternion().setFromEuler( angles[j], orders[i] );
			var m = new THREE.Matrix4().makeRotationFromEuler( angles[j], orders[i] );

			var v0 = new THREE.Vector3(1, 0, 0);
			var qv = v0.clone().applyQuaternion( q );
			var mv = v0.clone().applyMatrix4( m );

			ok( qv.distanceTo( mv ) < 0.001, "Passed!" );
		}
	}

});

test( "equals", function() {
	var a = new THREE.Quaternion( x, y, z, w );
	var b = new THREE.Quaternion( -x, -y, -z, -w );

	ok( a.x != b.x, "Passed!" );
	ok( a.y != b.y, "Passed!" );

	ok( ! a.equals( b ), "Passed!" );
	ok( ! b.equals( a ), "Passed!" );

	a.copy( b );
	ok( a.x == b.x, "Passed!" );
	ok( a.y == b.y, "Passed!" );

	ok( a.equals( b ), "Passed!" );
	ok( b.equals( a ), "Passed!" );
});


function doSlerpObject( aArr, bArr, t ) {

	var a = new THREE.Quaternion().fromArray( aArr ),
		b = new THREE.Quaternion().fromArray( bArr ),
		c = new THREE.Quaternion().fromArray( aArr );

	c.slerp( b, t );

	return {

		equals: function( x, y, z, w, maxError ) {

			if ( maxError === undefined ) maxError = Number.EPSILON;

			return 	Math.abs( x - c.x ) <= maxError &&
					Math.abs( y - c.y ) <= maxError &&
					Math.abs( z - c.z ) <= maxError &&
					Math.abs( w - c.w ) <= maxError;

		},

		length: c.length(),

		dotA: c.dot( a ),
		dotB: c.dot( b )

	};

}

function doSlerpArray( a, b, t ) {

	var result = [ 0, 0, 0, 0 ];

	THREE.Quaternion.slerpFlat( result, 0, a, 0, b, 0, t );

	function arrDot( a, b ) {

		return 	a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ] +
				a[ 2 ] * b[ 2 ] + a[ 3 ] * b[ 3 ];

	}

	return {

		equals: function( x, y, z, w, maxError ) {

			if ( maxError === undefined ) maxError = Number.EPSILON;

			return 	Math.abs( x - result[ 0 ] ) <= maxError &&
					Math.abs( y - result[ 1 ] ) <= maxError &&
					Math.abs( z - result[ 2 ] ) <= maxError &&
					Math.abs( w - result[ 3 ] ) <= maxError;

		},

		length: Math.sqrt( arrDot( result, result ) ),

		dotA: arrDot( result, a ),
		dotB: arrDot( result, b )

	};

}

function slerpTestSkeleton( doSlerp, maxError ) {

	var a, b, result;

	a = [
		0.6753410084407496,
		0.4087830051091744,
		0.32856700410659473,
		0.5185120064806223
	];

	b = [
		0.6602792107657797,
		0.43647413932562285,
		0.35119011210236006,
		0.5001871596632682
	];

	var maxNormError = 0;

	function isNormal( result ) {

		var normError = Math.abs( 1 - result.length );
		maxNormError = Math.max( maxNormError, normError );
		return normError <= maxError;

	}

	result = doSlerp( a, b, 0 );
	ok( result.equals(
			a[ 0 ], a[ 1 ], a[ 2 ], a[ 3 ], 0 ), "Exactly A @ t = 0" );

	result = doSlerp( a, b, 1 );
	ok( result.equals(
			b[ 0 ], b[ 1 ], b[ 2 ], b[ 3 ], 0 ), "Exactly B @ t = 1" );

	result = doSlerp( a, b, 0.5 );
	ok( Math.abs( result.dotA - result.dotB ) <= Number.EPSILON, "Symmetry at 0.5" );
	ok( isNormal( result ), "Approximately normal (at 0.5)" );

	result = doSlerp( a, b, 0.25 );
	ok( result.dotA > result.dotB, "Interpolating at 0.25" );
	ok( isNormal( result ), "Approximately normal (at 0.25)" );

	result = doSlerp( a, b, 0.75 );
	ok( result.dotA < result.dotB, "Interpolating at 0.75" );
	ok( isNormal( result ), "Approximately normal (at 0.75)" );

	var D = Math.SQRT1_2;

	result = doSlerp( [ 1, 0, 0, 0 ], [ 0, 0, 1, 0 ], 0.5 );
	ok( result.equals( D, 0, D, 0 ), "X/Z diagonal from axes" );
	ok( isNormal( result ), "Approximately normal (X/Z diagonal)" );

	result = doSlerp( [ 0, D, 0, D ], [ 0, -D, 0, D ], 0.5 );
	ok( result.equals( 0, 0, 0, 1 ), "W-Unit from diagonals" );
	ok( isNormal( result ), "Approximately normal (W-Unit)" );
}


test( "slerp", function() {

	slerpTestSkeleton( doSlerpObject, Number.EPSILON );

} );

test( "slerpFlat", function() {

	slerpTestSkeleton( doSlerpArray, Number.EPSILON );

} );
