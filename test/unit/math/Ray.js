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

	// behind the ray
	var b = a.closestPointToPoint( zero3 );
	ok( b.equals( one3 ), "Passed!" );

	// front of the ray
	var c = a.closestPointToPoint( new THREE.Vector3( 0, 0, 50 ) );
	ok( c.equals( new THREE.Vector3( 1, 1, 50 ) ), "Passed!" );

	// exactly on the ray
	var d = a.closestPointToPoint( one3 );
	ok( d.equals( one3 ), "Passed!" );
});

test( "distanceToPoint", function() {
	var a = new THREE.Ray( one3.clone(), new THREE.Vector3( 0, 0, 1 ) );

	// behind the ray
	var b = a.distanceToPoint( zero3 );
	ok( b === Math.sqrt( 3 ), "Passed!" );

	// front of the ray
	var c = a.distanceToPoint( new THREE.Vector3( 0, 0, 50 ) );
	ok( c === Math.sqrt( 2 ), "Passed!" );

	// exactly on the ray
	var d = a.distanceToPoint( one3 );
	ok( d === 0, "Passed!" );
});

test( "isIntersectionSphere", function() {
	var a = new THREE.Ray( one3.clone(), new THREE.Vector3( 0, 0, 1 ) );
	var b = new THREE.Sphere( zero3, 0.5 );
	var c = new THREE.Sphere( zero3, 1.5 );
	var d = new THREE.Sphere( one3, 0.1 );
	var e = new THREE.Sphere( two3, 0.1 );
	var f = new THREE.Sphere( two3, 1 );

	ok( ! a.isIntersectionSphere( b ), "Passed!" );
	ok( ! a.isIntersectionSphere( c ), "Passed!" );
	ok( a.isIntersectionSphere( d ), "Passed!" );
	ok( ! a.isIntersectionSphere( e ), "Passed!" );
	ok( ! a.isIntersectionSphere( f ), "Passed!" );
});

test( "intersectSphere", function() {
	
	var TOL = 0.0001;
	
	// ray a0 origin located at ( 0, 0, 0 ) and points outward in negative-z direction
	var a0 = new THREE.Ray( zero3.clone(), new THREE.Vector3( 0, 0, -1 ) );
	// ray a1 origin located at ( 1, 1, 1 ) and points left in negative-x direction
	var a1 = new THREE.Ray( one3.clone(), new THREE.Vector3( -1, 0, 0 ) );

	// sphere (radius of 2) located behind ray a0, should result in null
	var b = new THREE.Sphere( new THREE.Vector3( 0, 0, 3 ), 2 );
	ok( a0.intersectSphere( b ) === null, "Passed!" );
	
	// sphere (radius of 2) located in front of, but too far right of ray a0, should result in null
	var b = new THREE.Sphere( new THREE.Vector3( 3, 0, -1 ), 2 );
	ok( a0.intersectSphere( b ) === null, "Passed!" );
	
	// sphere (radius of 2) located below ray a1, should result in null
	var b = new THREE.Sphere( new THREE.Vector3( 1, -2, 1 ), 2 );
	ok( a1.intersectSphere( b ) === null, "Passed!" );
	
	// sphere (radius of 1) located to the left of ray a1, should result in intersection at 0, 1, 1 
	var b = new THREE.Sphere( new THREE.Vector3( -1, 1, 1 ), 1 );
	ok( a1.intersectSphere( b ).distanceTo( new THREE.Vector3( 0, 1, 1 ) ) < TOL, "Passed!" );
	
	// sphere (radius of 1) located in front of ray a0, should result in intersection at 0, 0, -1 
	var b = new THREE.Sphere( new THREE.Vector3( 0, 0, -2 ), 1 );
	ok( a0.intersectSphere( b ).distanceTo( new THREE.Vector3( 0, 0, -1 ) ) < TOL, "Passed!" );
	
	// sphere (radius of 2) located in front & right of ray a0, should result in intersection at 0, 0, -1, or left-most edge of sphere 
	var b = new THREE.Sphere( new THREE.Vector3( 2, 0, -1 ), 2 );
	ok( a0.intersectSphere( b ).distanceTo( new THREE.Vector3( 0, 0, -1 ) ) < TOL, "Passed!" );
	
	// same situation as above, but move the sphere a fraction more to the right, and ray a0 should now just miss 
	var b = new THREE.Sphere( new THREE.Vector3( 2.01, 0, -1 ), 2 );
	ok( a0.intersectSphere( b ) === null, "Passed!" );
	
	// following tests are for situations where the ray origin is inside the sphere
	
	// sphere (radius of 1) center located at ray a0 origin / sphere surrounds the ray origin, so the first intersect point 0, 0, 1, 
	// is behind ray a0.  Therefore, second exit point on back of sphere will be returned: 0, 0, -1
	// thus keeping the intersection point always in front of the ray.
	var b = new THREE.Sphere( zero3.clone(), 1 );
	ok( a0.intersectSphere( b ).distanceTo( new THREE.Vector3( 0, 0, -1 ) ) < TOL, "Passed!" );
	
	// sphere (radius of 4) center located behind ray a0 origin / sphere surrounds the ray origin, so the first intersect point 0, 0, 5, 
	// is behind ray a0.  Therefore, second exit point on back of sphere will be returned: 0, 0, -3
	// thus keeping the intersection point always in front of the ray.
	var b = new THREE.Sphere( new THREE.Vector3( 0, 0, 1 ), 4 );
	ok( a0.intersectSphere( b ).distanceTo( new THREE.Vector3( 0, 0, -3 ) ) < TOL, "Passed!" );
	
	// sphere (radius of 4) center located in front of ray a0 origin / sphere surrounds the ray origin, so the first intersect point 0, 0, 3, 
	// is behind ray a0.  Therefore, second exit point on back of sphere will be returned: 0, 0, -5
	// thus keeping the intersection point always in front of the ray.
	var b = new THREE.Sphere( new THREE.Vector3( 0, 0, -1 ), 4 );
	ok( a0.intersectSphere( b ).distanceTo( new THREE.Vector3( 0, 0, -5 ) ) < TOL, "Passed!" );
	
});

test( "isIntersectionPlane", function() {
	var a = new THREE.Ray( one3.clone(), new THREE.Vector3( 0, 0, 1 ) );

	// parallel plane in front of the ray
	var b = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 0, 0, 1 ), one3.clone().sub( new THREE.Vector3( 0, 0, -1 ) ) );
	ok( a.isIntersectionPlane( b ), "Passed!" );

	// parallel plane coincident with origin
	var c = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 0, 0, 1 ), one3.clone().sub( new THREE.Vector3( 0, 0, 0 ) ) );
	ok( a.isIntersectionPlane( c ), "Passed!" );

	// parallel plane behind the ray
	var d = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 0, 0, 1 ), one3.clone().sub( new THREE.Vector3( 0, 0, 1 ) ) );
	ok( ! a.isIntersectionPlane( d ), "Passed!" );

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
	ok( a.intersectPlane( b ) === null, "Passed!" );

	// parallel plane coincident with origin
	var c = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 1, 1, 0 ) );
	ok( a.intersectPlane( c ) === null, "Passed!" );

	// parallel plane infront
	var d = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 1, 1, 1 ) );
	ok( a.intersectPlane( d ).equals( a.origin ), "Passed!" );

	// perpendical ray that overlaps exactly
	var e = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 1, 0, 0 ), one3 );
	ok( a.intersectPlane( e ).equals( a.origin ), "Passed!" );

	// perpendical ray that doesn't overlap
	var f = new THREE.Plane().setFromNormalAndCoplanarPoint( new THREE.Vector3( 1, 0, 0 ), zero3 );
	ok( a.intersectPlane( f ) === null, "Passed!" );
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


test( "distanceSqToSegment", function() {
	var a = new THREE.Ray( one3.clone(), new THREE.Vector3( 0, 0, 1 ) );
	var ptOnLine = new THREE.Vector3();
	var ptOnSegment = new THREE.Vector3();

	//segment in front of the ray
	var v0 = new THREE.Vector3( 3, 5, 50 );
	var v1 = new THREE.Vector3( 50, 50, 50 ); // just a far away point
	var distSqr = a.distanceSqToSegment( v0, v1, ptOnLine, ptOnSegment );

	ok( ptOnSegment.distanceTo( v0 ) < 0.0001, "Passed!" );
	ok( ptOnLine.distanceTo( new THREE.Vector3(1, 1, 50) ) < 0.0001, "Passed!" );
	// ((3-1) * (3-1) + (5-1) * (5-1) = 4 + 16 = 20
	ok( Math.abs( distSqr - 20 ) < 0.0001, "Passed!" );

	//segment behind the ray
	v0 = new THREE.Vector3( -50, -50, -50 ); // just a far away point
	v1 = new THREE.Vector3( -3, -5, -4 );
	distSqr = a.distanceSqToSegment( v0, v1, ptOnLine, ptOnSegment );

	ok( ptOnSegment.distanceTo( v1 ) < 0.0001, "Passed!" );
	ok( ptOnLine.distanceTo( one3 ) < 0.0001, "Passed!" );
	// ((-3-1) * (-3-1) + (-5-1) * (-5-1) + (-4-1) + (-4-1) = 16 + 36 + 25 = 77
	ok( Math.abs( distSqr - 77 ) < 0.0001, "Passed!" );

	//exact intersection between the ray and the segment
	v0 = new THREE.Vector3( -50, -50, -50 );
	v1 = new THREE.Vector3( 50, 50, 50 );
	distSqr = a.distanceSqToSegment( v0, v1, ptOnLine, ptOnSegment );

	ok( ptOnSegment.distanceTo( one3 ) < 0.0001, "Passed!" );
	ok( ptOnLine.distanceTo( one3 ) < 0.0001, "Passed!" );
	ok( distSqr < 0.0001, "Passed!" );
});

test( "intersectBox", function() {

	var TOL = 0.0001;
	
	var box = new THREE.Box3( new THREE.Vector3(  -1, -1, -1 ), new THREE.Vector3( 1, 1, 1 ) );

	var a = new THREE.Ray( new THREE.Vector3( -2, 0, 0 ), new THREE.Vector3( 1, 0, 0) );
	//ray should intersect box at -1,0,0
	ok( a.isIntersectionBox(box) === true, "Passed!" );
	ok( a.intersectBox(box).distanceTo( new THREE.Vector3( -1, 0, 0 ) ) < TOL, "Passed!" );

	var b = new THREE.Ray( new THREE.Vector3( -2, 0, 0 ), new THREE.Vector3( -1, 0, 0) );
	//ray is point away from box, it should not intersect
	ok( b.isIntersectionBox(box) === false, "Passed!" );
	ok( b.intersectBox(box) === null, "Passed!" );

	var c = new THREE.Ray( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0) );
	// ray is inside box, should return exit point
	ok( c.isIntersectionBox(box) === true, "Passed!" );
	ok( c.intersectBox(box).distanceTo( new THREE.Vector3( 1, 0, 0 ) ) < TOL, "Passed!" );

	var d = new THREE.Ray( new THREE.Vector3( 0, 2, 1 ), new THREE.Vector3( 0, -1, -1).normalize() );
	//tilted ray should intersect box at 0,1,0
	ok( d.isIntersectionBox(box) === true, "Passed!" );
	ok( d.intersectBox(box).distanceTo( new THREE.Vector3( 0, 1, 0 ) ) < TOL, "Passed!" );	

	var e = new THREE.Ray( new THREE.Vector3( 1, -2, 1 ), new THREE.Vector3( 0, 1, 0).normalize() );
	//handle case where ray is coplanar with one of the boxes side - box in front of ray
	ok( e.isIntersectionBox(box) === true, "Passed!" );
	ok( e.intersectBox(box).distanceTo( new THREE.Vector3( 1, -1, 1 ) ) < TOL, "Passed!" );	
	
	var f = new THREE.Ray( new THREE.Vector3( 1, -2, 0 ), new THREE.Vector3( 0, -1, 0).normalize() );
	//handle case where ray is coplanar with one of the boxes side - box behind ray
	ok( f.isIntersectionBox(box) === false, "Passed!" );
	ok( f.intersectBox(box) == null, "Passed!" );		
	
});


