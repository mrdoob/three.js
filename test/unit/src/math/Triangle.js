/**
 * @author bhouston / http://exocortex.com
 */

QUnit.module( "Triangle" );

QUnit.test( "constructor" , function( assert ) {
	var a = new THREE.Triangle();
	assert.ok( a.a.equals( zero3 ), "Passed!" );
	assert.ok( a.b.equals( zero3 ), "Passed!" );
	assert.ok( a.c.equals( zero3 ), "Passed!" );

	a = new THREE.Triangle( one3.clone().negate(), one3.clone(), two3.clone() );
	assert.ok( a.a.equals( one3.clone().negate() ), "Passed!" );
	assert.ok( a.b.equals( one3 ), "Passed!" );
	assert.ok( a.c.equals( two3 ), "Passed!" );
});

QUnit.test( "copy" , function( assert ) {
	var a = new THREE.Triangle( one3.clone().negate(), one3.clone(), two3.clone() );
	var b = new THREE.Triangle().copy( a );
	assert.ok( b.a.equals( one3.clone().negate() ), "Passed!" );
	assert.ok( b.b.equals( one3 ), "Passed!" );
	assert.ok( b.c.equals( two3 ), "Passed!" );

	// ensure that it is a true copy
	a.a = one3;
	a.b = zero3;
	a.c = zero3;
	assert.ok( b.a.equals( one3.clone().negate() ), "Passed!" );
	assert.ok( b.b.equals( one3 ), "Passed!" );
	assert.ok( b.c.equals( two3 ), "Passed!" );
});

QUnit.test( "setFromPointsAndIndices" , function( assert ) {
	var a = new THREE.Triangle();

	var points = [ one3, one3.clone().negate(), two3 ];
	a.setFromPointsAndIndices( points, 1, 0, 2 );
	assert.ok( a.a.equals( one3.clone().negate() ), "Passed!" );
	assert.ok( a.b.equals( one3 ), "Passed!" );
	assert.ok( a.c.equals( two3 ), "Passed!" );

});

QUnit.test( "set" , function( assert ) {
	var a = new THREE.Triangle();

	a.set( one3.clone().negate(), one3, two3 );
	assert.ok( a.a.equals( one3.clone().negate() ), "Passed!" );
	assert.ok( a.b.equals( one3 ), "Passed!" );
	assert.ok( a.c.equals( two3 ), "Passed!" );

});

QUnit.test( "area" , function( assert ) {
	var a = new THREE.Triangle();

	assert.ok( a.area() == 0, "Passed!" );

	a = new THREE.Triangle( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ) );
	assert.ok( a.area() == 0.5, "Passed!" );

	a = new THREE.Triangle( new THREE.Vector3( 2, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 2 ) );
	assert.ok( a.area() == 2, "Passed!" );

	// colinear triangle.
	a = new THREE.Triangle( new THREE.Vector3( 2, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 3, 0, 0 ) );
	assert.ok( a.area() == 0, "Passed!" );
});

QUnit.test( "midpoint" , function( assert ) {
	var a = new THREE.Triangle();

	assert.ok( a.midpoint().equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );

	a = new THREE.Triangle( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ) );
	assert.ok( a.midpoint().equals( new THREE.Vector3( 1/3, 1/3, 0 ) ), "Passed!" );

	a = new THREE.Triangle( new THREE.Vector3( 2, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 2 ) );
	assert.ok( a.midpoint().equals( new THREE.Vector3( 2/3, 0, 2/3 ) ), "Passed!" );
});

QUnit.test( "normal" , function( assert ) {
	var a = new THREE.Triangle();

	assert.ok( a.normal().equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );

	a = new THREE.Triangle( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ) );
	assert.ok( a.normal().equals( new THREE.Vector3( 0, 0, 1 ) ), "Passed!" );

	a = new THREE.Triangle( new THREE.Vector3( 2, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 2 ) );
	assert.ok( a.normal().equals( new THREE.Vector3( 0, 1, 0 ) ), "Passed!" );
});

QUnit.test( "plane" , function( assert ) {
	var a = new THREE.Triangle();

	assert.ok( isNaN( a.plane().distanceToPoint( a.a ) ), "Passed!" );
	assert.ok( isNaN( a.plane().distanceToPoint( a.b ) ), "Passed!" );
	assert.ok( isNaN( a.plane().distanceToPoint( a.c ) ), "Passed!" );
	assert.propEqual( a.plane().normal, {x: NaN, y: NaN, z: NaN}, "Passed!" );

	a = new THREE.Triangle( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ) );
	assert.ok( a.plane().distanceToPoint( a.a ) == 0, "Passed!" );
	assert.ok( a.plane().distanceToPoint( a.b ) == 0, "Passed!" );
	assert.ok( a.plane().distanceToPoint( a.c ) == 0, "Passed!" );
	assert.ok( a.plane().normal.equals( a.normal() ), "Passed!" );

	a = new THREE.Triangle( new THREE.Vector3( 2, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 2 ) );
	assert.ok( a.plane().distanceToPoint( a.a ) == 0, "Passed!" );
	assert.ok( a.plane().distanceToPoint( a.b ) == 0, "Passed!" );
	assert.ok( a.plane().distanceToPoint( a.c ) == 0, "Passed!" );
	assert.ok( a.plane().normal.clone().normalize().equals( a.normal() ), "Passed!" );
});

QUnit.test( "barycoordFromPoint" , function( assert ) {
	var a = new THREE.Triangle();

	var bad = new THREE.Vector3( -2, -1, -1 );

	assert.ok( a.barycoordFromPoint( a.a ).equals( bad ), "Passed!" );
	assert.ok( a.barycoordFromPoint( a.b ).equals( bad ), "Passed!" );
	assert.ok( a.barycoordFromPoint( a.c ).equals( bad ), "Passed!" );

	a = new THREE.Triangle( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ) );
	assert.ok( a.barycoordFromPoint( a.a ).equals( new THREE.Vector3( 1, 0, 0 ) ), "Passed!" );
	assert.ok( a.barycoordFromPoint( a.b ).equals( new THREE.Vector3( 0, 1, 0 ) ), "Passed!" );
	assert.ok( a.barycoordFromPoint( a.c ).equals( new THREE.Vector3( 0, 0, 1 ) ), "Passed!" );
	assert.ok( a.barycoordFromPoint( a.midpoint() ).distanceTo( new THREE.Vector3( 1/3, 1/3, 1/3 ) ) < 0.0001, "Passed!" );

	a = new THREE.Triangle( new THREE.Vector3( 2, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 2 ) );
	assert.ok( a.barycoordFromPoint( a.a ).equals( new THREE.Vector3( 1, 0, 0 ) ), "Passed!" );
	assert.ok( a.barycoordFromPoint( a.b ).equals( new THREE.Vector3( 0, 1, 0 ) ), "Passed!" );
	assert.ok( a.barycoordFromPoint( a.c ).equals( new THREE.Vector3( 0, 0, 1 ) ), "Passed!" );
	assert.ok( a.barycoordFromPoint( a.midpoint() ).distanceTo( new THREE.Vector3( 1/3, 1/3, 1/3 ) ) < 0.0001, "Passed!" );
});

QUnit.test( "containsPoint" , function( assert ) {
	var a = new THREE.Triangle();

	assert.ok( ! a.containsPoint( a.a ), "Passed!" );
	assert.ok( ! a.containsPoint( a.b ), "Passed!" );
	assert.ok( ! a.containsPoint( a.c ), "Passed!" );

	a = new THREE.Triangle( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ) );
	assert.ok( a.containsPoint( a.a ), "Passed!" );
	assert.ok( a.containsPoint( a.b ), "Passed!" );
	assert.ok( a.containsPoint( a.c ), "Passed!" );
	assert.ok( a.containsPoint( a.midpoint() ), "Passed!" );
	assert.ok( ! a.containsPoint( new THREE.Vector3( -1, -1, -1 ) ), "Passed!" );

	a = new THREE.Triangle( new THREE.Vector3( 2, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 2 ) );
	assert.ok( a.containsPoint( a.a ), "Passed!" );
	assert.ok( a.containsPoint( a.b ), "Passed!" );
	assert.ok( a.containsPoint( a.c ), "Passed!" );
	assert.ok( a.containsPoint( a.midpoint() ), "Passed!" );
	assert.ok( ! a.containsPoint( new THREE.Vector3( -1, -1, -1 ) ), "Passed!" );
});

QUnit.test( "closestPointToPoint" , function( assert ) {

	var a = new THREE.Triangle( new THREE.Vector3( -1, 0, 0 ), new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ) );

	// point lies inside the triangle
	var b0 = a.closestPointToPoint( new THREE.Vector3( 0, 0.5, 0 ) );
	assert.ok( b0.equals( new THREE.Vector3( 0, 0.5, 0 ) ), "Passed!" );

	// point lies on a vertex
	b0 = a.closestPointToPoint( a.a );
	assert.ok( b0.equals( a.a ), "Passed!" );
	b0 = a.closestPointToPoint( a.b );
	assert.ok( b0.equals( a.b ), "Passed!" );
	b0 = a.closestPointToPoint( a.c );
	assert.ok( b0.equals( a.c ), "Passed!" );

	// point lies on an edge
	b0 = a.closestPointToPoint( zero3.clone() );
	assert.ok( b0.equals( zero3.clone() ), "Passed!" );

	// point lies outside the triangle
	b0 = a.closestPointToPoint( new THREE.Vector3( -2, 0, 0 ) );
	assert.ok( b0.equals( new THREE.Vector3( -1, 0, 0 ) ), "Passed!" );
	b0 = a.closestPointToPoint( new THREE.Vector3( 2, 0, 0 ) );
	assert.ok( b0.equals( new THREE.Vector3( 1, 0, 0 ) ), "Passed!" );
	b0 = a.closestPointToPoint( new THREE.Vector3( 0, 2, 0 ) );
	assert.ok( b0.equals( new THREE.Vector3( 0, 1, 0 ) ), "Passed!" );
	b0 = a.closestPointToPoint( new THREE.Vector3( 0, -2, 0 ) );
	assert.ok( b0.equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );
});
