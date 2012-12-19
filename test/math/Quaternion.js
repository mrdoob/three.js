/**
 * @author bhouston / http://exocortex.com
 */

module( "Quaternion" );

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

	b1.multiplySelf( b2 );
	ok( a.equals( b1 ), "Passed!" );
});

test( "setFromRotationMatrix", function() {

	// TODO: find cases to validate.
	ok( true, "Passed!" );

});

test( "fromEuler/toEuler", function() {

	// TODO: find cases to validate.
	ok( true, "Passed!" );

});

test( "add", function() {
	var a = new THREE.Quaternion( x, y, z, w );
	var b = new THREE.Quaternion( -x, -y, -z, -w );

	a.addSelf( b );
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );
	ok( a.z == 0, "Passed!" );
	ok( a.w == 0, "Passed!" );

	var c = new THREE.Quaternion().add( b, b );
	ok( c.x == -2*x, "Passed!" );
	ok( c.y == -2*y, "Passed!" );	
	ok( c.z == -2*z, "Passed!" );
	ok( c.w == -2*w, "Passed!" );	
});

test( "normalize/length", function() {
	var a = new THREE.Quaternion( x, y, z, w );
	var b = new THREE.Quaternion( -x, -y, -z, -w );

	ok( a.length() != 1, "Passed!");
	a.normalize();
	ok( a.length() == 1, "Passed!");

	a.set( 0, 0, 0, 0 );
	ok( a.length() == 0, "Passed!");
	a.normalize();
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


test( "multiply/multiplySelf", function() {

	// TODO: find cases to validate.
	ok( true, "Passed!" );

});

test( "multiplyVector3", function() {
	
	// TODO: find cases to validate.
	ok( true, "Passed!" );

});

test( "slerpSelf/slerp", function() {

	// TODO: find cases to validate.
	ok( true, "Passed!" );

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
