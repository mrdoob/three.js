/**
 * @author bhouston / http://exocortex.com
 */

module( "Box3" );

test( "constructor", function() {
	var a = new THREE.Box3();
	ok( a.min.equals( posInf3 ), "Passed!" );
	ok( a.max.equals( negInf3 ), "Passed!" );

	a = new THREE.Box3( zero3.clone(), zero3.clone() );
	ok( a.min.equals( zero3 ), "Passed!" );
	ok( a.max.equals( zero3 ), "Passed!" );

	a = new THREE.Box3( zero3.clone(), one3.clone() );
	ok( a.min.equals( zero3 ), "Passed!" );
	ok( a.max.equals( one3 ), "Passed!" );
});

test( "copy", function() {
	var a = new THREE.Box3( zero3.clone(), one3.clone() );
	var b = new THREE.Box3().copy( a );
	ok( b.min.equals( zero3 ), "Passed!" );
	ok( b.max.equals( one3 ), "Passed!" );

	// ensure that it is a true copy
	a.min = zero3;
	a.max = one3;
	ok( b.min.equals( zero3 ), "Passed!" );
	ok( b.max.equals( one3 ), "Passed!" );
});

test( "set", function() {
	var a = new THREE.Box3();

	a.set( zero3, one3 );
	ok( a.min.equals( zero3 ), "Passed!" );
	ok( a.max.equals( one3 ), "Passed!" );
});

test( "setFromPoints", function() {
	var a = new THREE.Box3();

	a.setFromPoints( [ zero3, one3, two3 ] );
	ok( a.min.equals( zero3 ), "Passed!" );
	ok( a.max.equals( two3 ), "Passed!" );

	a.setFromPoints( [ one3 ] );
	ok( a.min.equals( one3 ), "Passed!" );
	ok( a.max.equals( one3 ), "Passed!" );

	a.setFromPoints( [] );
	ok( a.empty(), "Passed!" );
});

test( "empty/makeEmpty", function() {
	var a = new THREE.Box3();

	ok( a.empty(), "Passed!" );

	var a = new THREE.Box3( zero3.clone(), one3.clone() );
	ok( ! a.empty(), "Passed!" );

	a.makeEmpty();
	ok( a.empty(), "Passed!" );
});

test( "center", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );

	ok( a.center().equals( zero3 ), "Passed!" );

	a = new THREE.Box3( zero3.clone(), one3.clone() );
	var midpoint = one3.clone().multiplyScalar( 0.5 );
	ok( a.center().equals( midpoint ), "Passed!" );
});

test( "size", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );

	ok( a.size().equals( zero3 ), "Passed!" );

	a = new THREE.Box3( zero3.clone(), one3.clone() );
	ok( a.size().equals( one3 ), "Passed!" );
});

test( "expandByPoint", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );

	a.expandByPoint( zero3 );
	ok( a.size().equals( zero3 ), "Passed!" );

	a.expandByPoint( one3 );
	ok( a.size().equals( one3 ), "Passed!" );

	a.expandByPoint( one3.clone().negate() );
	ok( a.size().equals( one3.clone().multiplyScalar( 2 ) ), "Passed!" );
	ok( a.center().equals( zero3 ), "Passed!" );
});

test( "expandByVector", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );

	a.expandByVector( zero3 );
	ok( a.size().equals( zero3 ), "Passed!" );

	a.expandByVector( one3 );
	ok( a.size().equals( one3.clone().multiplyScalar( 2 ) ), "Passed!" );
	ok( a.center().equals( zero3 ), "Passed!" );
});

test( "expandByScalar", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );

	a.expandByScalar( 0 );
	ok( a.size().equals( zero3 ), "Passed!" );

	a.expandByScalar( 1 );
	ok( a.size().equals( one3.clone().multiplyScalar( 2 ) ), "Passed!" );
	ok( a.center().equals( zero3 ), "Passed!" );
});

test( "containsPoint", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );

	ok( a.containsPoint( zero3 ), "Passed!" );
	ok( ! a.containsPoint( one3 ), "Passed!" );

	a.expandByScalar( 1 );
	ok( a.containsPoint( zero3 ), "Passed!" );
	ok( a.containsPoint( one3 ), "Passed!" );
	ok( a.containsPoint( one3.clone().negate() ), "Passed!" );
});

test( "containsBox", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( zero3.clone(), one3.clone() );
	var c = new THREE.Box3( one3.clone().negate(), one3.clone() );

	ok( a.containsBox( a ), "Passed!" );
	ok( ! a.containsBox( b ), "Passed!" );
	ok( ! a.containsBox( c ), "Passed!" );

	ok( b.containsBox( a ), "Passed!" );
	ok( c.containsBox( a ), "Passed!" );
	ok( ! b.containsBox( c ), "Passed!" );
});

test( "getParameter", function() {
	var a = new THREE.Box3( zero3.clone(), one3.clone() );
	var b = new THREE.Box3( one3.clone().negate(), one3.clone() );

	ok( a.getParameter( new THREE.Vector3( 0, 0, 0 ) ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );
	ok( a.getParameter( new THREE.Vector3( 1, 1, 1 ) ).equals( new THREE.Vector3( 1, 1, 1 ) ), "Passed!" );

	ok( b.getParameter( new THREE.Vector3( -1, -1, -1 ) ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );
	ok( b.getParameter( new THREE.Vector3( 0, 0, 0 ) ).equals( new THREE.Vector3( 0.5, 0.5, 0.5 ) ), "Passed!" );
	ok( b.getParameter( new THREE.Vector3( 1, 1, 1 ) ).equals( new THREE.Vector3( 1, 1, 1 ) ), "Passed!" );
});

test( "clampPoint", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( one3.clone().negate(), one3.clone() );

	ok( a.clampPoint( new THREE.Vector3( 0, 0, 0 ) ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );
	ok( a.clampPoint( new THREE.Vector3( 1, 1, 1 ) ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );
	ok( a.clampPoint( new THREE.Vector3( -1, -1, -1 ) ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );

	ok( b.clampPoint( new THREE.Vector3( 2, 2, 2 ) ).equals( new THREE.Vector3( 1, 1, 1 ) ), "Passed!" );
	ok( b.clampPoint( new THREE.Vector3( 1, 1, 1 ) ).equals( new THREE.Vector3( 1, 1, 1 ) ), "Passed!" );
	ok( b.clampPoint( new THREE.Vector3( 0, 0, 0 ) ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );
	ok( b.clampPoint( new THREE.Vector3( -1, -1, -1 ) ).equals( new THREE.Vector3( -1, -1, -1 ) ), "Passed!" );
	ok( b.clampPoint( new THREE.Vector3( -2, -2, -2 ) ).equals( new THREE.Vector3( -1, -1, -1 ) ), "Passed!" );
});

test( "distanceToPoint", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( one3.clone().negate(), one3.clone() );

	ok( a.distanceToPoint( new THREE.Vector3( 0, 0, 0 ) ) == 0, "Passed!" );
	ok( a.distanceToPoint( new THREE.Vector3( 1, 1, 1 ) ) == Math.sqrt( 3 ), "Passed!" );
	ok( a.distanceToPoint( new THREE.Vector3( -1, -1, -1 ) ) == Math.sqrt( 3 ), "Passed!" );

	ok( b.distanceToPoint( new THREE.Vector3( 2, 2, 2 ) ) == Math.sqrt( 3 ), "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector3( 1, 1, 1 ) ) == 0, "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector3( 0, 0, 0 ) ) == 0, "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector3( -1, -1, -1 ) ) == 0, "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector3( -2, -2, -2 ) ) == Math.sqrt( 3 ), "Passed!" );
});

test( "distanceToPoint", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( one3.clone().negate(), one3.clone() );

	ok( a.distanceToPoint( new THREE.Vector3( 0, 0, 0 ) ) == 0, "Passed!" );
	ok( a.distanceToPoint( new THREE.Vector3( 1, 1, 1 ) ) == Math.sqrt( 3 ), "Passed!" );
	ok( a.distanceToPoint( new THREE.Vector3( -1, -1, -1 ) ) == Math.sqrt( 3 ), "Passed!" );

	ok( b.distanceToPoint( new THREE.Vector3( 2, 2, 2 ) ) == Math.sqrt( 3 ), "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector3( 1, 1, 1 ) ) == 0, "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector3( 0, 0, 0 ) ) == 0, "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector3( -1, -1, -1 ) ) == 0, "Passed!" );
	ok( b.distanceToPoint( new THREE.Vector3( -2, -2, -2 ) ) == Math.sqrt( 3 ), "Passed!" );
});

test( "isIntersectionBox", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( zero3.clone(), one3.clone() );
	var c = new THREE.Box3( one3.clone().negate(), one3.clone() );

	ok( a.isIntersectionBox( a ), "Passed!" );
	ok( a.isIntersectionBox( b ), "Passed!" );
	ok( a.isIntersectionBox( c ), "Passed!" );

	ok( b.isIntersectionBox( a ), "Passed!" );
	ok( c.isIntersectionBox( a ), "Passed!" );
	ok( b.isIntersectionBox( c ), "Passed!" );

	b.translate( new THREE.Vector3( 2, 2, 2 ) );
	ok( ! a.isIntersectionBox( b ), "Passed!" );
	ok( ! b.isIntersectionBox( a ), "Passed!" );
	ok( ! b.isIntersectionBox( c ), "Passed!" );
});

test( "getBoundingSphere", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( zero3.clone(), one3.clone() );
	var c = new THREE.Box3( one3.clone().negate(), one3.clone() );

	ok( a.getBoundingSphere().equals( new THREE.Sphere( zero3, 0 ) ), "Passed!" );
	ok( b.getBoundingSphere().equals( new THREE.Sphere( one3.clone().multiplyScalar( 0.5 ), Math.sqrt( 3 ) * 0.5 ) ), "Passed!" );
	ok( c.getBoundingSphere().equals( new THREE.Sphere( zero3, Math.sqrt( 12 ) * 0.5 ) ), "Passed!" );
});

test( "intersect", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( zero3.clone(), one3.clone() );
	var c = new THREE.Box3( one3.clone().negate(), one3.clone() );

	ok( a.clone().intersect( a ).equals( a ), "Passed!" );
	ok( a.clone().intersect( b ).equals( a ), "Passed!" );
	ok( b.clone().intersect( b ).equals( b ), "Passed!" );
	ok( a.clone().intersect( c ).equals( a ), "Passed!" );
	ok( b.clone().intersect( c ).equals( b ), "Passed!" );
	ok( c.clone().intersect( c ).equals( c ), "Passed!" );
});

test( "union", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( zero3.clone(), one3.clone() );
	var c = new THREE.Box3( one3.clone().negate(), one3.clone() );

	ok( a.clone().union( a ).equals( a ), "Passed!" );
	ok( a.clone().union( b ).equals( b ), "Passed!" );
	ok( a.clone().union( c ).equals( c ), "Passed!" );
	ok( b.clone().union( c ).equals( c ), "Passed!" );
});

var compareBox = function ( a, b, threshold ) {
	threshold = threshold || 0.0001;
	return ( a.min.distanceTo( b.min ) < threshold &&
	a.max.distanceTo( b.max ) < threshold );
};

test( "applyMatrix4", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( zero3.clone(), one3.clone() );
	var c = new THREE.Box3( one3.clone().negate(), one3.clone() );
	var d = new THREE.Box3( one3.clone().negate(), zero3.clone() );

	var m = new THREE.Matrix4().makeTranslation( 1, -2, 1 );
	var t1 = new THREE.Vector3( 1, -2, 1 );

	ok( compareBox( a.clone().applyMatrix4( m ), a.clone().translate( t1 ) ), "Passed!" );
	ok( compareBox( b.clone().applyMatrix4( m ), b.clone().translate( t1 ) ), "Passed!" );
	ok( compareBox( c.clone().applyMatrix4( m ), c.clone().translate( t1 ) ), "Passed!" );
	ok( compareBox( d.clone().applyMatrix4( m ), d.clone().translate( t1 ) ), "Passed!" );
});

test( "translate", function() {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( zero3.clone(), one3.clone() );
	var c = new THREE.Box3( one3.clone().negate(), one3.clone() );
	var d = new THREE.Box3( one3.clone().negate(), zero3.clone() );

	ok( a.clone().translate( one3 ).equals( new THREE.Box3( one3, one3 ) ), "Passed!" );
	ok( a.clone().translate( one3 ).translate( one3.clone().negate() ).equals( a ), "Passed!" );
	ok( d.clone().translate( one3 ).equals( b ), "Passed!" );
	ok( b.clone().translate( one3.clone().negate() ).equals( d ), "Passed!" );
});
