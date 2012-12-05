/**
 * @author bhouston / http://exocortex.com
 */

module( "Triangle3" );

test( "constructor", function() {
	var a = new THREE.Triangle3();
	ok( a.a.equals( zero3 ), "Passed!" );
	ok( a.b.equals( zero3 ), "Passed!" );
	ok( a.c.equals( zero3 ), "Passed!" );

	a = new THREE.Triangle3( one3.clone().negate(), one3, two3 );
	ok( a.a.equals( one3.clone().negate() ), "Passed!" );
	ok( a.b.equals( one3 ), "Passed!" );
	ok( a.c.equals( two3 ), "Passed!" );
});

test( "copy", function() {
	var a = new THREE.Triangle3( one3.clone().negate(), one3, two3 );
	var b = new THREE.Triangle3().copy( a );
	ok( b.a.equals( one3.clone().negate() ), "Passed!" );
	ok( b.b.equals( one3 ), "Passed!" );
	ok( b.c.equals( two3 ), "Passed!" );

	// ensure that it is a true copy
	a.a = one3;
	a.b = zero3;
	a.c = zero3;
	ok( b.a.equals( one3.clone().negate() ), "Passed!" );
	ok( b.b.equals( one3 ), "Passed!" );
	ok( b.c.equals( two3 ), "Passed!" );
});

test( "setFromPointsAndIndices", function() {
	var a = new THREE.Triangle3();

	var points = [ one3, one3.clone().negate(), two3 ];
	a.setFromPointsAndIndices( points, 1, 0, 2 );
	ok( a.a.equals( one3.clone().negate() ), "Passed!" );
	ok( a.b.equals( one3 ), "Passed!" );
	ok( a.c.equals( two3 ), "Passed!" );

});

test( "set", function() {
	var a = new THREE.Triangle3();

	a.set( one3.clone().negate(), one3, two3 );
	ok( a.a.equals( one3.clone().negate() ), "Passed!" );
	ok( a.b.equals( one3 ), "Passed!" );
	ok( a.c.equals( two3 ), "Passed!" );

});

test( "area", function() {
	var a = new THREE.Triangle3();

	ok( a.area() == 0, "Passed!" );

	a = new THREE.Triangle3( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ) );
	ok( a.area() == 0.5, "Passed!" );

	a = new THREE.Triangle3( new THREE.Vector3( 2, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 2 ) );
	ok( a.area() == 2, "Passed!" );

	// colinear triangle.
	a = new THREE.Triangle3( new THREE.Vector3( 2, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 3, 0, 0 ) );
	ok( a.area() == 0, "Passed!" );
});

test( "midpoint", function() {
	var a = new THREE.Triangle3();

	ok( a.midpoint().equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );

	a = new THREE.Triangle3( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ) );
	ok( a.midpoint().equals( new THREE.Vector3( 1/3, 1/3, 0 ) ), "Passed!" );

	a = new THREE.Triangle3( new THREE.Vector3( 2, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 2 ) );
	ok( a.midpoint().equals( new THREE.Vector3( 2/3, 0, 2/3 ) ), "Passed!" );
});

test( "normal", function() {
	var a = new THREE.Triangle3();

	ok( a.normal().equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );

	a = new THREE.Triangle3( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ) );
	ok( a.normal().equals( new THREE.Vector3( 0, 0, 1 ) ), "Passed!" );

	a = new THREE.Triangle3( new THREE.Vector3( 2, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 2 ) );
	ok( a.normal().equals( new THREE.Vector3( 0, 1, 0 ) ), "Passed!" );
});

test( "plane", function() {
	var a = new THREE.Triangle3();

	// artificial normal is created in this case.
	ok( a.plane().distanceToPoint( a.a ) == 0, "Passed!" );
	ok( a.plane().distanceToPoint( a.b ) == 0, "Passed!" );
	ok( a.plane().distanceToPoint( a.c ) == 0, "Passed!" );
	ok( a.plane().normal.equals( a.normal() ), "Passed!" );

	a = new THREE.Triangle3( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ) );
	ok( a.plane().distanceToPoint( a.a ) == 0, "Passed!" );
	ok( a.plane().distanceToPoint( a.b ) == 0, "Passed!" );
	ok( a.plane().distanceToPoint( a.c ) == 0, "Passed!" );
	ok( a.plane().normal.equals( a.normal() ), "Passed!" );

	a = new THREE.Triangle3( new THREE.Vector3( 2, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 2 ) );
	ok( a.plane().distanceToPoint( a.a ) == 0, "Passed!" );
	ok( a.plane().distanceToPoint( a.b ) == 0, "Passed!" );
	ok( a.plane().distanceToPoint( a.c ) == 0, "Passed!" );
	ok( a.plane().normal.clone().normalize().equals( a.normal() ), "Passed!" );
});

test( "containsPoint", function() {
	var a = new THREE.Triangle3();

	ok( ! a.containsPoint( a.a ), "Passed!" );
	ok( ! a.containsPoint( a.b ), "Passed!" );
	ok( ! a.containsPoint( a.c ), "Passed!" );

	a = new THREE.Triangle3( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ) );
	ok( a.containsPoint( a.a ), "Passed!" );
	ok( a.containsPoint( a.b ), "Passed!" );
	ok( a.containsPoint( a.c ), "Passed!" );
	ok( a.containsPoint( a.midpoint() ), "Passed!" );
	ok( ! a.containsPoint( new THREE.Vector3( -1, -1, -1 ) ), "Passed!" );

	a = new THREE.Triangle3( new THREE.Vector3( 2, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 2 ) );
	ok( a.containsPoint( a.a ), "Passed!" );
	ok( a.containsPoint( a.b ), "Passed!" );
	ok( a.containsPoint( a.c ), "Passed!" );
	ok( a.containsPoint( a.midpoint() ), "Passed!" );
	ok( ! a.containsPoint( new THREE.Vector3( -1, -1, -1 ) ), "Passed!" );
});
