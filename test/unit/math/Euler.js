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

test( "set", function() {
	var a = new THREE.Euler();

	a.set( 0, 1, 0, "ZYX" );
	ok( a.equals( eulerAzyx ), "Passed!" );
	ok( ! a.equals( eulerAxyz ), "Passed!" );
	ok( ! a.equals( eulerZero ), "Passed!" );
});

test( "Quaternion.setFromEuler/Euler.fromQuaternion", function() {
	var testValues = [ eulerZero, eulerAxyz, eulerAzyx ];
	for( var i = 0; i < testValues.length; i ++ ) {
		var v = testValues[i];
		var q = new THREE.Quaternion().setFromEuler( v );

		var v2 = new THREE.Euler().setFromQuaternion( q, v.order );
		var q2 = new THREE.Quaternion().setFromEuler( v2 );
		ok( q.equals( q2 ), "Passed!" );	
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
		ok( q.equals( q2 ), "Passed!" );	

		v.reorder( 'ZXY' );
		var q3 = new THREE.Quaternion().setFromEuler( v );
		ok( q.equals( q3 ), "Passed!" );	
	}
});
