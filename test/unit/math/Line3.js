/**
 * @author bhouston / http://exocortex.com
 */

module( "Line3" );

test( "constructor/equals", function() {
	var a = new THREE.Line3();
	ok( a.start.equals( zero3 ), "Passed!" );
	ok( a.end.equals( zero3 ), "Passed!" );

	a = new THREE.Line3( two3.clone(), one3.clone() );
	ok( a.start.equals( two3 ), "Passed!" );
	ok( a.end.equals( one3 ), "Passed!" );
});

test( "copy/equals", function() {
	var a = new THREE.Line3( zero3.clone(), one3.clone() );
	var b = new THREE.Line3().copy( a );
	ok( b.start.equals( zero3 ), "Passed!" );
	ok( b.end.equals( one3 ), "Passed!" );

	// ensure that it is a true copy
	a.start = zero3;
	a.end = one3;
	ok( b.start.equals( zero3 ), "Passed!" );
	ok( b.end.equals( one3 ), "Passed!" );
});

test( "set", function() {
	var a = new THREE.Line3();

	a.set( one3, one3 );
	ok( a.start.equals( one3 ), "Passed!" );
	ok( a.end.equals( one3 ), "Passed!" );
});

test( "at", function() {
	var a = new THREE.Line3( one3.clone(), new THREE.Vector3( 1, 1, 2 ) );

	ok( a.at( -1 ).distanceTo( new THREE.Vector3( 1, 1, 0 ) ) < 0.0001, "Passed!" );
	ok( a.at( 0 ).distanceTo( one3.clone() ) < 0.0001, "Passed!" );
	ok( a.at( 1 ).distanceTo( new THREE.Vector3( 1, 1, 2 ) ) < 0.0001, "Passed!" );
	ok( a.at( 2 ).distanceTo( new THREE.Vector3( 1, 1, 3 ) ) < 0.0001, "Passed!" );
});

test( "closestPointToPoint/closestPointToPointParameter", function() {
	var a = new THREE.Line3( one3.clone(), new THREE.Vector3( 1, 1, 2 ) );

	// nearby the ray
	ok( a.closestPointToPointParameter( zero3.clone(), true ) == 0, "Passed!" );
	var b1 = a.closestPointToPoint( zero3.clone(), true );
	ok( b1.distanceTo( new THREE.Vector3( 1, 1, 1 ) ) < 0.0001, "Passed!" );

	// nearby the ray
	ok( a.closestPointToPointParameter( zero3.clone(), false ) == -1, "Passed!" );
	var b2 = a.closestPointToPoint( zero3.clone(), false );
	ok( b2.distanceTo( new THREE.Vector3( 1, 1, 0 ) ) < 0.0001, "Passed!" );

	// nearby the ray
	ok( a.closestPointToPointParameter( new THREE.Vector3( 1, 1, 5 ), true ) == 1, "Passed!" );
	var b = a.closestPointToPoint( new THREE.Vector3( 1, 1, 5 ), true );
	ok( b.distanceTo( new THREE.Vector3( 1, 1, 2 ) ) < 0.0001, "Passed!" );

	// exactly on the ray
	ok( a.closestPointToPointParameter( one3.clone(), true ) == 0, "Passed!" );
	var c = a.closestPointToPoint( one3.clone(), true );
	ok( c.distanceTo( one3.clone() ) < 0.0001, "Passed!" );
});