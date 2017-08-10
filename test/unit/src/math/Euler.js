/**
 * @author bhouston / http://exocortex.com
 */

QUnit.module( "Euler" );

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

QUnit.test( "constructor/equals", function( assert ) {
	var a = new THREE.Euler();
	assert.ok( a.equals( eulerZero ), "Passed!" );
	assert.ok( ! a.equals( eulerAxyz ), "Passed!" );
	assert.ok( ! a.equals( eulerAzyx ), "Passed!" );
});

QUnit.test( "clone/copy/equals", function( assert ) {
	var a = eulerAxyz.clone();
	assert.ok( a.equals( eulerAxyz ), "Passed!" );
	assert.ok( ! a.equals( eulerZero ), "Passed!" );
	assert.ok( ! a.equals( eulerAzyx ), "Passed!" );

	a.copy( eulerAzyx );
	assert.ok( a.equals( eulerAzyx ), "Passed!" );
	assert.ok( ! a.equals( eulerAxyz ), "Passed!" );
	assert.ok( ! a.equals( eulerZero ), "Passed!" );

});

QUnit.test( "set/setFromVector3/toVector3", function( assert ) {
	var a = new THREE.Euler();

	a.set( 0, 1, 0, "ZYX" );
	assert.ok( a.equals( eulerAzyx ), "Passed!" );
	assert.ok( ! a.equals( eulerAxyz ), "Passed!" );
	assert.ok( ! a.equals( eulerZero ), "Passed!" );

	var vec = new THREE.Vector3( 0, 1, 0 );

	var b = new THREE.Euler().setFromVector3( vec, "ZYX" );
	assert.ok( a.equals( b ), "Passed!" );

	var c = b.toVector3();
	assert.ok( c.equals( vec ), "Passed!" );	
});

QUnit.test( "Quaternion.setFromEuler/Euler.fromQuaternion", function( assert ) {
	var testValues = [ eulerZero, eulerAxyz, eulerAzyx ];
	for( var i = 0; i < testValues.length; i ++ ) {
		var v = testValues[i];
		var q = new THREE.Quaternion().setFromEuler( v );

		var v2 = new THREE.Euler().setFromQuaternion( q, v.order );
		var q2 = new THREE.Quaternion().setFromEuler( v2 );
		assert.ok( quatEquals( q, q2 ), "Passed!" );
	}
});


QUnit.test( "Matrix4.setFromEuler/Euler.fromRotationMatrix", function( assert ) {
	var testValues = [ eulerZero, eulerAxyz, eulerAzyx ];
	for( var i = 0; i < testValues.length; i ++ ) {
		var v = testValues[i];
		var m = new THREE.Matrix4().makeRotationFromEuler( v );

		var v2 = new THREE.Euler().setFromRotationMatrix( m, v.order );
		var m2 = new THREE.Matrix4().makeRotationFromEuler( v2 );
		assert.ok( matrixEquals4( m, m2, 0.0001 ), "Passed!" );
	}
});

QUnit.test( "reorder" , function( assert ) {
	var testValues = [ eulerZero, eulerAxyz, eulerAzyx ];
	for( var i = 0; i < testValues.length; i ++ ) {
		var v = testValues[i];
		var q = new THREE.Quaternion().setFromEuler( v );

		v.reorder( 'YZX' );
		var q2 = new THREE.Quaternion().setFromEuler( v );
		assert.ok( quatEquals( q, q2 ), "Passed!" );

		v.reorder( 'ZXY' );
		var q3 = new THREE.Quaternion().setFromEuler( v );
		assert.ok( quatEquals( q, q3 ), "Passed!" );
	}
});


QUnit.test( "gimbalLocalQuat" , function( assert ) {
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
	assert.ok( eulerEquals( eViaQ1, eViaMViaQ1 ), "Passed!" );  // this result is correct

});
