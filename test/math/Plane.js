/**
 * @author bhouston / http://exocortex.com
 */

module( "Plane" );

test( "constructor", function() {
	var a = new THREE.Plane();
	ok( a.normal.x == 0, "Passed!" );
	ok( a.normal.y == 0, "Passed!" );
	ok( a.normal.z == 0, "Passed!" );
	ok( a.constant == 0, "Passed!" );

	a = new THREE.Plane( one3, 0 );
	ok( a.normal.x == 1, "Passed!" );
	ok( a.normal.y == 1, "Passed!" );
	ok( a.normal.z == 1, "Passed!" );
	ok( a.constant == 0, "Passed!" );

	a = new THREE.Plane( one3, 1 );
	ok( a.normal.x == 1, "Passed!" );
	ok( a.normal.y == 1, "Passed!" );
	ok( a.normal.z == 1, "Passed!" );
	ok( a.constant == 1, "Passed!" );
});

test( "copy", function() {
	var a = new THREE.Plane( new THREE.Vector3( x, y, z ), w );
	var b = new THREE.Plane().copy( a );
	ok( b.normal.x == x, "Passed!" );
	ok( b.normal.y == y, "Passed!" );
	ok( b.normal.z == z, "Passed!" );
	ok( b.constant == w, "Passed!" );

	// ensure that it is a true copy
	a.normal.x = 0;
	a.normal.y = -1;
	a.normal.z = -2;
	a.constant = -3;
	ok( b.normal.x == x, "Passed!" );
	ok( b.normal.y == y, "Passed!" );
	ok( b.normal.z == z, "Passed!" );
	ok( b.constant == w, "Passed!" );
});

test( "set", function() {
	var a = new THREE.Plane();
	ok( a.normal.x == 0, "Passed!" );
	ok( a.normal.y == 0, "Passed!" );
	ok( a.normal.z == 0, "Passed!" );
	ok( a.constant == 0, "Passed!" );

	var b = a.clone().set( new THREE.Vector3( x, y, z ), w );
	ok( b.normal.x == x, "Passed!" );
	ok( b.normal.y == y, "Passed!" );
	ok( b.normal.z == z, "Passed!" );
	ok( b.constant == w, "Passed!" );
});

test( "setComponents", function() {
	var a = new THREE.Plane();
	ok( a.normal.x == 0, "Passed!" );
	ok( a.normal.y == 0, "Passed!" );
	ok( a.normal.z == 0, "Passed!" );
	ok( a.constant == 0, "Passed!" );

	var b = a.clone().setComponents( x, y, z , w );
	ok( b.normal.x == x, "Passed!" );
	ok( b.normal.y == y, "Passed!" );
	ok( b.normal.z == z, "Passed!" );
	ok( b.constant == w, "Passed!" );
});

test( "setFromNormalAndCoplanarPoint", function() {
	var a = new THREE.Plane().setFromNormalAndCoplanarPoint( one3, zero3 );
	
	ok( a.normal.equals( one3 ), "Passed!" );
	ok( a.constant == 0, "Passed!" );
});

test( "normalize", function() {
	var a = new THREE.Plane( new THREE.Vector3( 2, 0, 0 ), 2 );
	
	a.normalize();
	ok( a.normal.length() == 1, "Passed!" );
	ok( a.normal.equals( new THREE.Vector3( 1, 0, 0 ) ), "Passed!" );
	ok( a.constant == 1, "Passed!" );
});
