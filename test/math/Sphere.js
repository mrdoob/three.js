/**
 * @author bhouston / http://exocortex.com
 */

module( "Sphere" );

test( "constructor", function() {
	var a = new THREE.Sphere();
	ok( a.center.equals( zero3 ), "Passed!" );
	ok( a.radius == 0, "Passed!" );

	a = new THREE.Sphere( one3, 1 );
	ok( a.center.equals( one3 ), "Passed!" );
	ok( a.radius == 1, "Passed!" );
});

test( "copy", function() {
	var a = new THREE.Sphere( one3, 1 );
	var b = new THREE.Sphere().copy( a );

	ok( b.center.equals( one3 ), "Passed!" );
	ok( b.radius == 1, "Passed!" );

	// ensure that it is a true copy
	a.center = zero3;
	a.radius = 0;
	ok( b.center.equals( one3 ), "Passed!" );
	ok( b.radius == 1, "Passed!" );
});

test( "set", function() {
	var a = new THREE.Sphere();
	ok( a.center.equals( zero3 ), "Passed!" );
	ok( a.radius == 0, "Passed!" );

	a.set( one3, 1 );
	ok( a.center.equals( one3 ), "Passed!" );
	ok( a.radius == 1, "Passed!" );
});
