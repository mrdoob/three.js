/**
 * @author bhouston / http://exocortex.com
 */

var x = 2;
var y = 3;
var z = 4;
var w = 5;

var zero = new THREE.Vector3();
var one = new THREE.Vector3( 1, 1, 1 );

module( "Sphere" );

test( "constructor", function() {
	var a = new THREE.Sphere();
	ok( a.center.equals( zero ), "Passed!" );
	ok( a.radius == 0, "Passed!" );

	a = new THREE.Sphere( one, 1 );
	ok( a.center.equals( one ), "Passed!" );
	ok( a.radius == 0, "Passed!" );
});

test( "copy", function() {
	var a = new THREE.Sphere( one, 1 );
	var b = new THREE.Sphere().copy( a );

	ok( b.center.equals( one ), "Passed!" );
	ok( b.radius == 0, "Passed!" );

	// ensure that it is a true copy
	a.center = zero;
	a.radius = 0;
	ok( b.center.equals( one ), "Passed!" );
	ok( b.radius == 0, "Passed!" );
});

test( "set", function() {
	var a = new THREE.Vector3();
	ok( a.center.equals( zero ), "Passed!" );
	ok( a.radius == 0, "Passed!" );

	a.set( one, radius )
	ok( a.center.equals( one ), "Passed!" );
	ok( a.radius == 0, "Passed!" );
});
