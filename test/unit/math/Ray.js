/**
 * @author bhouston / http://exocortex.com
 */

module( "Ray" );

test( "constructor/equals", function() {
	var a = new THREE.Ray();
	ok( a.origin.equals( zero3 ), "Passed!" );
	ok( a.direction.equals( zero3 ), "Passed!" );

	a = new THREE.Ray( two3.clone(), one3.clone() );
	ok( a.origin.equals( two3 ), "Passed!" );
	ok( a.direction.equals( one3 ), "Passed!" );
});

test( "copy/equals", function() {
	var a = new THREE.Ray( zero3.clone(), one3.clone() );
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

	a.set( one3, one3 );
	ok( a.origin.equals( one3 ), "Passed!" );
	ok( a.direction.equals( one3 ), "Passed!" );
});

test( "at", function() {
	var a = new THREE.Ray( one3.clone(), new THREE.Vector3( 0, 0, 1 ) );

	ok( a.at( 0 ).equals( one3 ), "Passed!" );
	ok( a.at( -1 ).equals( new THREE.Vector3( 1, 1, 0 ) ), "Passed!" );
	ok( a.at( 1 ).equals( new THREE.Vector3( 1, 1, 2 ) ), "Passed!" );
});

test( "recast/clone", function() {
	var a = new THREE.Ray( one3.clone(), new THREE.Vector3( 0, 0, 1 ) );

	ok( a.recast( 0 ).equals( a ), "Passed!" );

	var b = a.clone();
	ok( b.recast( -1 ).equals( new THREE.Ray( new THREE.Vector3( 1, 1, 0 ), new THREE.Vector3( 0, 0, 1 ) ) ), "Passed!" );

	var c = a.clone();
	ok( c.recast( 1 ).equals( new THREE.Ray( new THREE.Vector3( 1, 1, 2 ), new THREE.Vector3( 0, 0, 1 ) ) ), "Passed!" );

	var d = a.clone();
	var e = d.clone().recast( 1 );
	ok( d.equals( a ), "Passed!" );
	ok( ! e.equals( d ), "Passed!" );
	ok( e.equals( c ), "Passed!" );
});

test( "closestPointToPoint", function() {
	var a = new THREE.Ray( one3.clone(), new THREE.Vector3( 0, 0, 1 ) );

	// nearby the ray
	var b = a.closestPointToPoint( zero3 );
	ok( b.equals( new THREE.Vector3( 1, 1, 0 ) ), "Passed!" );

	// exactly on the ray
	var c = a.closestPointToPoint( one3 );
	ok( c.equals( one3 ), "Passed!" );
});

test( "distanceToPoint", function() {
	var a = new THREE.Ray( one3.clone(), new THREE.Vector3( 0, 0, 1 ) );

	// nearby the ray
	var b = a.distanceToPoint( zero3 );
	ok( b == Math.sqrt( 2 ), "Passed!" );

	// exactly on the ray
	var c = a.distanceToPoint( one3 );
	ok( c == 0, "Passed!" );
});

test( "isIntersectionSphere", function() {
	var a = new THREE.Ray( one3.clone(), new THREE.Vector3( 0, 0, 1 ) );
	var b = new THREE.Sphere( zero3, 0.5 );
	var c = new THREE.Sphere( zero3, 1.5 );
	var d = new THREE.Sphere( one3, 0.1 );
	var e = new THREE.Sphere( two3, 0.1 );
	var f = new THREE.Sphere( two3, 1 );

	ok( ! a.isIntersectionSphere( b ), "Passed!" );
	ok( a.isIntersectionSphere( c ), "Passed!" );
	ok( a.isIntersectionSphere( d ), "Passed!" );
	ok( ! a.isIntersectionSphere( e ), "Passed!" );
	ok( ! a.isIntersectionSphere( f ), "Passed!" );
});

test( "isIntersectionPlane", function() {
	var a = new THREE.Ray( one3.clone(), new THREE.Vector3( 0, 0, 1 ) );

	// parallel plane behind
	var b = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 0, 0, 1 ), one3.clone().sub( new THREE.Vector3( 0, 0, -1 ) ) );
	ok( a.isIntersectionPlane( b ), "Passed!" );

	// parallel plane coincident with origin
	var c = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 0, 0, 1 ), one3.clone().sub( new THREE.Vector3( 0, 0, 0 ) ) );
	ok( a.isIntersectionPlane( c ), "Passed!" );

	// parallel plane infront
	var d = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 0, 0, 1 ), one3.clone().sub( new THREE.Vector3( 0, 0, 1 ) ) );
	ok( a.isIntersectionPlane( d ), "Passed!" );

	// perpendical ray that overlaps exactly
	var e = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 1, 0, 0 ), one3 );
	ok( a.isIntersectionPlane( e ), "Passed!" );

	// perpendical ray that doesn't overlap
	var f = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 1, 0, 0 ), zero3 );
	ok( ! a.isIntersectionPlane( f ), "Passed!" );
});

test( "intersectPlane", function() {
	var a = new THREE.Ray( one3.clone(), new THREE.Vector3( 0, 0, 1 ) );

	// parallel plane behind
	var b = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 1, 1, -1 ) );
	ok( a.intersectPlane( b ).equals( new THREE.Vector3( 1, 1, -1 ) ), "Passed!" );

	// parallel plane coincident with origin
	var c = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 1, 1, 0 ) );
	ok( a.intersectPlane( c ).equals( new THREE.Vector3( 1, 1, 0 ) ), "Passed!" );

	// parallel plane infront
	var d = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 1, 1, 1 ) );
	ok( a.intersectPlane( d ).equals( new THREE.Vector3( 1, 1, 1 ) ), "Passed!" );

	// perpendical ray that overlaps exactly
	var e = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 1, 0, 0 ), one3 );
	ok( a.intersectPlane( e ).equals( a.origin ), "Passed!" );

	// perpendical ray that doesn't overlap
	var f = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 1, 0, 0 ), zero3 );
	ok( a.intersectPlane( f ) === undefined, "Passed!" );
});


test( "applyMatrix4", function() {
	var a = new THREE.Ray( one3.clone(), new THREE.Vector3( 0, 0, 1 ) );
	var m = new THREE.Matrix4();

	ok( a.clone().applyMatrix4( m ).equals( a ), "Passed!" );

	a = new THREE.Ray( zero3.clone(), new THREE.Vector3( 0, 0, 1 ) );
	m.makeRotationZ( Math.PI );
	ok( a.clone().applyMatrix4( m ).equals( a ), "Passed!" );

	m.makeRotationX( Math.PI );
	var b = a.clone();
	b.direction.negate();
	var a2 = a.clone().applyMatrix4( m );
	ok( a2.origin.distanceTo( b.origin ) < 0.0001, "Passed!" );
	ok( a2.direction.distanceTo( b.direction ) < 0.0001, "Passed!" );

	a.origin = new THREE.Vector3( 0, 0, 1 );
	b.origin = new THREE.Vector3( 0, 0, -1 );
	var a2 = a.clone().applyMatrix4( m );
	ok( a2.origin.distanceTo( b.origin ) < 0.0001, "Passed!" );
	ok( a2.direction.distanceTo( b.direction ) < 0.0001, "Passed!" );
});



