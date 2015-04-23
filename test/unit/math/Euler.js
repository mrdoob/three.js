/**
 * @author bhouston / http://exocortex.com
 */

module( "Euler" );

var eulerZero = new THREE.Euler( 0, 0, 0, "XYZ" );
var eulerAxyz = new THREE.Euler( 1, 0, 0, "XYZ" );
var eulerAzyx = new THREE.Euler( 0, 1, 0, "ZYX" );
	
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

var eulerEquals = function( a, b, tolerance ) {
	tolerance = tolerance || 0.0001;
	var diff = Math.abs( a.x - b.x ) + Math.abs( a.y - b.y ) + Math.abs( a.z - b.z );	
	return ( diff < tolerance );
};


var quatEquals = function( a, b, tolerance ) {
	tolerance = tolerance || 0.0001;
	var diff = Math.abs( a.x - b.x ) + Math.abs( a.y - b.y ) + Math.abs( a.z - b.z ) + Math.abs( a.w - b.w );	
	return ( diff < tolerance );
};

test( "constructor/equals", function() {
	var a = new THREE.Euler();
	ok( a.equals( eulerZero ), "Passed!" );
	ok( ! a.equals( eulerAxyz ), "Passed!" );
	ok( ! a.equals( eulerAzyx ), "Passed!" );
});

test( "clone/copy/equals", function() {
	var a = eulerAxyz.clone();
	ok( a.equals( eulerAxyz ), "Passed!" );
	ok( ! a.equals( eulerZero ), "Passed!" );
	ok( ! a.equals( eulerAzyx ), "Passed!" );

	a.copy( eulerAzyx );
	ok( a.equals( eulerAzyx ), "Passed!" );
	ok( ! a.equals( eulerAxyz ), "Passed!" );
	ok( ! a.equals( eulerZero ), "Passed!" );

});

test( "set/setFromVector3/toVector3", function() {
	var a = new THREE.Euler();

	a.set( 0, 1, 0, "ZYX" );
	ok( a.equals( eulerAzyx ), "Passed!" );
	ok( ! a.equals( eulerAxyz ), "Passed!" );
	ok( ! a.equals( eulerZero ), "Passed!" );

	var vec = new THREE.Vector3( 0, 1, 0 );

	var b = new THREE.Euler().setFromVector3( vec, "ZYX" );
	console.log( a, b );
	ok( a.equals( b ), "Passed!" );

	var c = b.toVector3();
	console.log( c, vec );
	ok( c.equals( vec ), "Passed!" );	
});

test( "Quaternion.setFromEuler/Euler.fromQuaternion", function() {
	var testValues = [ eulerZero, eulerAxyz, eulerAzyx ];
	for( var i = 0; i < testValues.length; i ++ ) {
		var v = testValues[i];
		var q = new THREE.Quaternion().setFromEuler( v );

		var v2 = new THREE.Euler().setFromQuaternion( q, v.order );
		var q2 = new THREE.Quaternion().setFromEuler( v2 );
		ok( eulerEquals( q, q2 ), "Passed!" );	
	}
});


test( "Matrix4.setFromEuler/Euler.fromRotationMatrix", function() {
	var testValues = [ eulerZero, eulerAxyz, eulerAzyx ];
	for( var i = 0; i < testValues.length; i ++ ) {
		var v = testValues[i];
		var m = new THREE.Matrix4().makeRotationFromEuler( v );

		var v2 = new THREE.Euler().setFromRotationMatrix( m, v.order );
		var m2 = new THREE.Matrix4().makeRotationFromEuler( v2 );
		ok( matrixEquals4( m, m2, 0.0001 ), "Passed!" );	
	}
});

test( "reorder", function() {
	var testValues = [ eulerZero, eulerAxyz, eulerAzyx ];
	for( var i = 0; i < testValues.length; i ++ ) {
		var v = testValues[i];
		var q = new THREE.Quaternion().setFromEuler( v );

		v.reorder( 'YZX' );		
		var q2 = new THREE.Quaternion().setFromEuler( v );
		ok( quatEquals( q, q2 ), "Passed!" );	

		v.reorder( 'ZXY' );
		var q3 = new THREE.Quaternion().setFromEuler( v );
		ok( quatEquals( q, q3 ), "Passed!" );	
	}
});


test( "gimbalLocalQuat", function() {
	// known problematic quaternions
	var q1 = new THREE.Quaternion( 0.5207769385244341, -0.4783214164122354, 0.520776938524434, 0.47832141641223547 );
	var q2 = new THREE.Quaternion( 0.11284905712620674, 0.6980437630368944, -0.11284905712620674, 0.6980437630368944 );

	var eulerOrder = "ZYX";

	// create Euler directly from a Quaternion
	var eViaQ1 = new THREE.Euler().setFromQuaternion( q1, eulerOrder ); // there is likely a bug here

	// create Euler from Quaternion via an intermediate Matrix4
	var mViaQ1 = new THREE.Matrix4().makeRotationFromQuaternion( q1 );
	var eViaMViaQ1 = new THREE.Euler().setFromRotationMatrix( mViaQ1, eulerOrder );

	// the results here are different
	ok( eulerEquals( eViaQ1, eViaMViaQ1 ), "Passed!" );  // this result is correct

});