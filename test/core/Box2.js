/**
 * @author bhouston / http://exocortex.com
 */

var x = 2;
var y = 3;
var z = 4;
var w = 5;

var negInf = new THREE.Vector3( -Infinity, -Infinity );
var posInf = new THREE.Vector3( Infinity, Infinity );

var zero = new THREE.Vector3();
var one = new THREE.Vector3( 1, 1, 1 );

module( "Box2" );

test( "constructor", function() {
	var a = new THREE.Box2();
	ok( a.min.equals( posInf ), "Passed!" );
	ok( a.max.equals( negInf ), "Passed!" );

	a = new THREE.Box2( zero );
	ok( a.min.equals( zero ), "Passed!" );
	ok( a.max.equals( zero ), "Passed!" );

	a = new THREE.Box2( zero, one );
	ok( a.min.equals( zero ), "Passed!" );
	ok( a.max.equals( one ), "Passed!" );
});

test( "copy", function() {
	var a = new THREE.Box2( zero, one );
	var b = new THREE.Box2().copy( a );
	ok( b.min.equals( zero ), "Passed!" );
	ok( b.max.equals( one ), "Passed!" );

	// ensure that it is a true copy
	a.min = zero;
	a.max = one;
	ok( b.min.equals( zero ), "Passed!" );
	ok( b.max.equals( one ), "Passed!" );
});

test( "set", function() {
	var a = new THREE.Box2();

	a.set( zero, one )
	ok( a.min.equals( zero ), "Passed!" );
	ok( a.max.equals( one ), "Passed!" );
});

test( "empty/makeEmpty", function() {
	var a = new THREE.Box2();

	ok( a.empty(), "Passed!" );

	var a = new THREE.Box2( zero, one );
	ok( ! a.empty(), "Passed!" );

	a.makeEmpty();
	ok( a.empty(), "Passed!" );
});

test( "volume", function() {
	var a = new THREE.Box2( zero, one );
	ok( a.volume() == 1, "Passed!" );
});

test( "center", function() {
	var a = new THREE.Box2( zero );

	ok( a.center().equals( zero ), "Passed!" );

	a = new THREE.Box2( zero, one );
	var midpoint = one.clone().multiplyScalar( 0.5 );
	ok( a.center().equals( midpoint ), "Passed!" );
});

test( "size", function() {
	var a = new THREE.Box2( zero );

	ok( a.size().equals( zero ), "Passed!" );

	a = new THREE.Box2( zero, one );
	ok( a.size().equals( one ), "Passed!" );
});

test( "expandByPoint", function() {
	var a = new THREE.Box2( zero );

	a.expandByPoint( zero );
	ok( a.size().equals( zero ), "Passed!" );

	a.expandByPoint( one );
	ok( a.size().equals( one ), "Passed!" );

	a.expandByPoint( one.clone().negate() );
	ok( a.size().equals( one.clone().multiplyScalar( 2 ) ), "Passed!" );
	ok( a.center().equals( zero ), "Passed!" );
});

test( "expandByVector", function() {
	var a = new THREE.Box2( zero );

	a.expandByVector( zero );
	ok( a.size().equals( zero ), "Passed!" );

	a.expandByVector( one );
	ok( a.size().equals( one.clone().multiplyScalar( 2 ) ), "Passed!" );
	ok( a.center().equals( zero ), "Passed!" );
});

test( "expandByScalar", function() {
	var a = new THREE.Box2( zero );

	a.expandByScalar( 0 );
	ok( a.size().equals( zero ), "Passed!" );

	a.expandByScalar( 1 );
	ok( a.size().equals( oneone.clone().multiplyScalar( 2 ) ), "Passed!" );
	ok( a.center().equals( zero ), "Passed!" );
});

test( "containsPoint", function() {
	var a = new THREE.Box2( zero );

	ok( a.containsPoint( zero ), "Passed!" );
	ok( ! a.containsPoint( one ), "Passed!" );

	a.expandByScalar( 1 );
	ok( a.containsPoint( zero ), "Passed!" );
	ok( a.containsPoint( one ), "Passed!" );
	ok( a.containsPoint( one.clone().negate() ), "Passed!" );
});

test( "containsBox", function() {
	var a = new THREE.Box2( zero );
	var b = new THREE.Box2( zero, one );
	var c = new THREE.Box2( one.clone().negate(), one );

	ok( a.containsBox( a ), "Passed!" );
	ok( ! a.containsBox( b ), "Passed!" );
	ok( ! a.containsBox( c ), "Passed!" );

	ok( b.containsBox( a ), "Passed!" );
	ok( c.containsBox( a ), "Passed!" );
	ok( ! b.containsBox( c ), "Passed!" );
});

test( "getParameter", function() {
	var a = new THREE.Box2( zero, one );
	var b = new THREE.Box2( one.clone().negate(), one );

	ok( a.getParameter( new THREE.Vector2( 0, 0 ) ).equals( new THREE.Vector2( 0, 0 ) ), "Passed!" );
	ok( a.getParameter( new THREE.Vector2( 1, 1 ) ).equals( new THREE.Vector2( 1, 1 ) ), "Passed!" );

	ok( b.getParameter( new THREE.Vector2( -1, -1 ) ).equals( new THREE.Vector2( 0, 0 ) ), "Passed!" );
	ok( b.getParameter( new THREE.Vector2( 0, 0 ) ).equals( new THREE.Vector2( 0.5, 0.5 ) ), "Passed!" );
	ok( b.getParameter( new THREE.Vector2( 1, 1 ) ).equals( new THREE.Vector2( 1, 1 ) ), "Passed!" );
});

test( "clampPoint", function() {
	var a = new THREE.Box2( zero, one );
	var b = new THREE.Box2( one.clone().negate(), one );

	ok( a.clampPoint( new THREE.Vector2( 0, 0 ) ).equals( new THREE.Vector2( 0, 0 ) ), "Passed!" );
	ok( a.clampPoint( new THREE.Vector2( 1, 1 ) ).equals( new THREE.Vector2( 0, 0 ) ), "Passed!" );
	ok( a.clampPoint( new THREE.Vector2( -1, -1 ) ).equals( new THREE.Vector2( 0, 0 ) ), "Passed!" );

	ok( b.clampPoint( new THREE.Vector2( 2, 2 ) ).equals( new THREE.Vector2( 1, 1 ) ), "Passed!" );
	ok( b.clampPoint( new THREE.Vector2( 1, 1 ) ).equals( new THREE.Vector2( 1, 1 ) ), "Passed!" );
	ok( b.clampPoint( new THREE.Vector2( 0, 0 ) ).equals( new THREE.Vector2( 0, 0 ) ), "Passed!" );
	ok( b.clampPoint( new THREE.Vector2( -1, -1 ) ).equals( new THREE.Vector2( -1, -1 ) ), "Passed!" );
	ok( b.clampPoint( new THREE.Vector2( -2, -2 ) ).equals( new THREE.Vector2( -1, -1 ) ), "Passed!" );
});

test( "distanceToPoint", function() {
	var a = new THREE.Box2( zero, one );
	var b = new THREE.Box2( one.clone().negate(), one );

	ok( a.distanceToPoint( new THREE.Vector2( 0, 0 ) ) == 0, "Passed!" );
	ok( a.distanceToPoint( new THREE.Vector2( 1, 1 ) ) == Math.sqrt( 2 ), "Passed!" );
	ok( a.distanceToPoint( new THREE.Vector2( -1, -1 ) ) == Math.sqrt( 2 ), "Passed!" );

	ok( b.distanceToPoint( new THREE.Vector2( 2, 2 ) ) == Math.sqrt( 2 ), "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector2( 1, 1 ) ) == 0, "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector2( 0, 0 ) ) == 0, "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector2( -1, -1 ) ) == 0, "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector2( -2, -2 ) ) == Math.sqrt( 2 ), "Passed!" );
});

test( "distanceToPoint", function() {
	var a = new THREE.Box2( zero, one );
	var b = new THREE.Box2( one.clone().negate(), one );

	ok( a.distanceToPoint( new THREE.Vector2( 0, 0 ) ) == 0, "Passed!" );
	ok( a.distanceToPoint( new THREE.Vector2( 1, 1 ) ) == Math.sqrt( 2 ), "Passed!" );
	ok( a.distanceToPoint( new THREE.Vector2( -1, -1 ) ) == Math.sqrt( 2 ), "Passed!" );

	ok( b.distanceToPoint( new THREE.Vector2( 2, 2 ) ) == Math.sqrt( 2 ), "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector2( 1, 1 ) ) == 0, "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector2( 0, 0 ) ) == 0, "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector2( -1, -1 ) ) == 0, "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector2( -2, -2 ) ) == Math.sqrt( 2 ), "Passed!" );
});

test( "isIntersection", function() {
	var a = new THREE.Box2( zero );
	var b = new THREE.Box2( zero, one );
	var c = new THREE.Box2( one.clone().negate(), one );

	ok( a.isIntersection( a ), "Passed!" );
	ok( a.isIntersection( b ), "Passed!" );
	ok( a.isIntersection( c ), "Passed!" );

	ok( b.isIntersection( a ), "Passed!" );
	ok( c.isIntersection( a ), "Passed!" );
	ok( b.isIntersection( c ), "Passed!" );

	b.translate( one.clone().translate( new THREE.Vector2( 2, 2 ) ));
	ok( ! a.isIntersection( b ), "Passed!" );
	ok( ! b.isIntersection( a ), "Passed!" );
	ok( ! c.isIntersection( a ), "Passed!" );
	ok( ! b.isIntersection( c ), "Passed!" );
});

test( "intersect", function() {
	var a = new THREE.Box2( zero );
	var b = new THREE.Box2( zero, one );
	var c = new THREE.Box2( one.clone().negate(), one );

	ok( a.clone().intersect( a ).equals( a ), "Passed!" );
	ok( a.clone().intersect( b ).equals( a ), "Passed!" );
	ok( b.clone().intersect( b ).equals( b ), "Passed!" );
	ok( a.clone().intersect( c ).equals( a ), "Passed!" );
	ok( b.clone().intersect( c ).equals( b ), "Passed!" );
	ok( c.clone().intersect( c ).equals( c ), "Passed!" );
});

test( "union", function() {
	var a = new THREE.Box2( zero );
	var b = new THREE.Box2( zero, one );
	var c = new THREE.Box2( one.clone().negate(), one );

	ok( a.clone().union( a ).equals( a ), "Passed!" );
	ok( a.clone().union( b ).equals( b ), "Passed!" );
	ok( a.clone().union( c ).equals( c ), "Passed!" );
	ok( b.clone().union( c ).equals( c ), "Passed!" );
});

test( "translate", function() {
	var a = new THREE.Box2( zero );
	var b = new THREE.Box2( zero, one );
	var c = new THREE.Box2( one.clone().negate(), one );
	var d = new THREE.Box2( one.clone().negate(), zero );

	ok( a.clone().translate( one ).equals( new THREE.Box2( one, one ) ), "Passed!" );
	ok( a.clone().translate( one ).translate( one.clone().negate() ).equals( a ), "Passed!" );
	ok( d.clone().translate( one ).equals( b ), "Passed!" );
	ok( b.clone().translate( one.clone().negate() ).equals( d ), "Passed!" );
});

test( "scale", function() {
	var a = new THREE.Box2( zero );
	var b = new THREE.Box2( zero, one );
	var c = new THREE.Box2( one.clone().negate(), one );
	var d = new THREE.Box2( one.clone().negate(), zero );

	ok( b.clone().scale( 0 ).equals( a ), "Passed!" );
	ok( b.clone().scale( 2 ).equals( new THREE.Box2( zero, new THREE.Vector2( 2, 2 ) ) ), "Passed!" );
	ok( d.clone().scale( 2 ).equals( new THREE.Box2( new THREE.Vector2( 2, 2 ).negate(), zero ) ), "Passed!" );
});
