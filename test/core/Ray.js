/**
 * @author bhouston / http://exocortex.com
 */

module( "Ray" );

test( "constructor", function() {
	var a = new THREE.Ray();
	ok( a.origin.equals( zero3 ), "Passed!" );
	ok( a.direction.equals( zero3 ), "Passed!" );

	a = new THREE.Ray( two3, one3 );
	ok( a.origin.equals( two3 ), "Passed!" );
	ok( a.direction.equals( one3 ), "Passed!" );
});

test( "copy", function() {
	var a = new THREE.Ray( zero3, one3 );
	var b = new THREE.Ray().copy( a );
	ok( b.origin.equals( zero3 ), "Passed!" );
	ok( b.direction.equals( one3 ), "Passed!" );

	// ensure that it is a true copy
	a.origin = zero3;
	a.direction = one3;
	ok( b.origin.equals( zero3 ), "Passed!" );
	ok( b.direction.equals( one3 ), "Passed!" );
});

test( "set", function() {
	var a = new THREE.Ray();

	a.set( one3, one3 )
	ok( a.origin.equals( one3 ), "Passed!" );
	ok( a.direction.equals( one3 ), "Passed!" );
});

test( "at", function() {
	var a = new THREE.Ray( one3, new THREE.Vector3( 0, 0, 1 ) );

	ok( a.at( 0 ).equals( one3 ), "Passed!" );
	ok( a.at( -1 ).equals( new THREE.Vector3( 1, 1, 0 ) ), "Passed!" );
	ok( a.at( 1 ).equals( new THREE.Vector3( 1, 1, 2 ) ), "Passed!" );
});

test( "recast/recastSelf", function() {
	var a = new THREE.Ray( one3, new THREE.Vector3( 0, 0, 1 ) );

	ok( a.recastSelf( 0 ).equals( a ), "Passed!" );

	var b = a.clone();
	ok( b.recastSelf( -1 ).equals( new THREE.Ray( new THREE.Vector3( 1, 1, 0 ), new THREE.Vector3( 0, 0, 1 ) ) ), "Passed!" );

	var c = a.clone();
	ok( c.recastSelf( 1 ).equals( new THREE.Ray( new THREE.Vector3( 1, 1, 2 ), new THREE.Vector3( 0, 0, 1 ) ) ), "Passed!" );

	var d = a.clone();
	var e = d.recast( 1 );
	ok( d.equals( a ), "Passed!" );
	ok( ! e.equals( d ), "Passed!" );
	ok( e.equals( c ), "Passed!" );
});

test( "flip", function() {
	var a = new THREE.Ray( one3, new THREE.Vector3( 0, 0, 1 ) );

	var b = a.clone();
	b.flip();
	ok( b.direction.equals( new THREE.Vector3( 0, 0, -1 ) ), "Passed!" );
	ok( ! b.equals( a ), "Passed!" );

	// and let's flip back to original direction
	b.flip();
	ok( b.equals( a ), "Passed!" );
});

test( "closestPointToPoint", function() {
	var a = new THREE.Ray( one3, new THREE.Vector3( 0, 0, 1 ) );

	// nearby the ray
	var b = a.closestPointToPoint( zero3 );
	ok( b.equals( new THREE.Vector3( 1, 1, 0 ) ), "Passed!" );

	// exactly on the ray
	var c = a.closestPointToPoint( one3 );
	ok( c.equals( one3 ), "Passed!" );
});

test( "distanceToPoint", function() {
	var a = new THREE.Ray( one3, new THREE.Vector3( 0, 0, 1 ) );

	// nearby the ray
	var b = a.distanceToPoint( zero3 );
	ok( b == Math.sqrt( 2 ), "Passed!" );

	// exactly on the ray
	var c = a.distanceToPoint( one3 );
	ok( c == 0, "Passed!" );
});

test( "distanceToRay", function() {
	var a = new THREE.Ray( one3, new THREE.Vector3( 0, 0, 1 ) );
	
	// parallel ray
	var b = new THREE.Ray( zero3, new THREE.Vector3( 0, 0, 1 ) );
	ok( a.distanceToRay( b ) == Math.sqrt( 3 ), "Passed!" );

	// perpendical ray that intersects
	var c = new THREE.Ray( one3, new THREE.Vector3( 1, 0, 0 ) );
	ok( a.distanceToRay( c ) == 0, "Passed!" );

	// perpendical ray that doesn't intersects
	var d = new THREE.Ray( one3.clone().subSelf( new THREE.Vector3( 0, 0, -1 ) ), new THREE.Vector3( 1, 0, 0 ) );
	ok( a.distanceToRay( d ) == 1, "Passed!" );
});

test( "closestPointToRay", function() {
	var a = new THREE.Ray( one3, new THREE.Vector3( 0, 0, 1 ) );
	
	// parallel ray
	var b = new THREE.Ray( zero3, new THREE.Vector3( 0, 0, 1 ) );
	ok( a.closestPointToRay( b ).equals( one3 ), "Passed!" );

	// perpendical ray that intersects
	var c = new THREE.Ray( one3, new THREE.Vector3( 1, 0, 0 ) );
	ok( a.closestPointToRay( c ).equals( zero3 ), "Passed!" );

	// perpendical ray that doesn't intersects
	var d = new THREE.Ray( one3.clone().subSelf( new THREE.Vector3( 0, 0, -1 ) ), new THREE.Vector3( 1, 0, 0 ) );
	ok( a.closestPointToRay( d ).equals( new THREE.Vector3( 0, 0, 1 ) ), "Passed!" );
});

test( "isIntersectionPlane", function() {
	var a = new THREE.Ray( one3, new THREE.Vector3( 0, 0, 1 ) );
	
	// parallel plane behind
	var b = new THREE.Plane( one3.clone().subSelf( new THREE.Vector3( 0, 0, -1 ) ), new THREE.Vector3( 0, 0, 1 ) );
	ok( a.isIntersectionPlane( b ), "Passed!" );

	// parallel plane coincident with origin
	var c = new THREE.Plane( one3.clone().subSelf( new THREE.Vector3( 0, 0, 0 ) ), new THREE.Vector3( 0, 0, 1 ) );
	ok( a.isIntersectionPlane( c ), "Passed!" );

	// parallel plane infront
	var d = new THREE.Plane( one3.clone().subSelf( new THREE.Vector3( 0, 0, 1 ) ), new THREE.Vector3( 0, 0, 1 ) );
	ok( a.isIntersectionPlane( d ), "Passed!" );

	// perpendical ray that overlaps exactly
	var e = new THREE.Plane( one3, new THREE.Vector3( 1, 0, 0 ) );
	ok( a.isIntersectionPlane( e ), "Passed!" );

	// perpendical ray that doesn't overlap
	var f = new THREE.Plane( zero3, new THREE.Vector3( 1, 0, 0 ) );
	ok( ! a.isIntersectionPlane( f ), "Passed!" );
});

test( "intersectPlane", function() {
	var a = new THREE.Ray( one3, new THREE.Vector3( 0, 0, 1 ) );
	
	// parallel plane behind
	var b = new THREE.Plane( one3.clone().subSelf( new THREE.Vector3( 0, 0, -1 ) ), new THREE.Vector3( 0, 0, 1 ) );
	ok( a.intersectPlane( b ).equals( one3.clone().subSelf( new THREE.Vector3( 0, 0, -1 ) ) ), "Passed!" );

	// parallel plane coincident with origin
	var c = new THREE.Plane( one3.clone().subSelf( new THREE.Vector3( 0, 0, 0 ) ), new THREE.Vector3( 0, 0, 1 ) );
	ok( a.intersectPlane( c ).equals( one3.clone().subSelf( new THREE.Vector3( 0, 0, 0 ) ) ), "Passed!" );

	// parallel plane infront
	var d = new THREE.Plane( one3.clone().subSelf( new THREE.Vector3( 0, 0, 1 ) ), new THREE.Vector3( 0, 0, 1 ) );
	ok( a.intersectPlane( d ).equals( one3.clone().subSelf( new THREE.Vector3( 0, 0, 1 ) ) ), "Passed!" );

	// perpendical ray that overlaps exactly
	var e = new THREE.Plane( one3, new THREE.Vector3( 1, 0, 0 ) );
	ok( a.intersectPlane( e ) === e.origin, "Passed!" );

	// perpendical ray that doesn't overlap
	var f = new THREE.Plane( zero3, new THREE.Vector3( 1, 0, 0 ) );
	ok( ! a.intersectPlane( f ) === undefined, "Passed!" );
});