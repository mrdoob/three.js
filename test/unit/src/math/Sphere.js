/**
 * @author bhouston / http://exocortex.com
 */

QUnit.module( "Sphere" );

QUnit.test( "constructor" , function( assert ) {
	var a = new THREE.Sphere();
	assert.ok( a.center.equals( zero3 ), "Passed!" );
	assert.ok( a.radius == 0, "Passed!" );

	a = new THREE.Sphere( one3.clone(), 1 );
	assert.ok( a.center.equals( one3 ), "Passed!" );
	assert.ok( a.radius == 1, "Passed!" );
});

QUnit.test( "copy" , function( assert ) {
	var a = new THREE.Sphere( one3.clone(), 1 );
	var b = new THREE.Sphere().copy( a );

	assert.ok( b.center.equals( one3 ), "Passed!" );
	assert.ok( b.radius == 1, "Passed!" );

	// ensure that it is a true copy
	a.center = zero3;
	a.radius = 0;
	assert.ok( b.center.equals( one3 ), "Passed!" );
	assert.ok( b.radius == 1, "Passed!" );
});

QUnit.test( "set" , function( assert ) {
	var a = new THREE.Sphere();
	assert.ok( a.center.equals( zero3 ), "Passed!" );
	assert.ok( a.radius == 0, "Passed!" );

	a.set( one3, 1 );
	assert.ok( a.center.equals( one3 ), "Passed!" );
	assert.ok( a.radius == 1, "Passed!" );
});

QUnit.test( "empty" , function( assert ) {
	var a = new THREE.Sphere();
	assert.ok( a.empty(), "Passed!" );

	a.set( one3, 1 );
	assert.ok( ! a.empty(), "Passed!" );
});

QUnit.test( "containsPoint" , function( assert ) {
	var a = new THREE.Sphere( one3.clone(), 1 );

	assert.ok( ! a.containsPoint( zero3 ), "Passed!" );
	assert.ok( a.containsPoint( one3 ), "Passed!" );
});

QUnit.test( "distanceToPoint" , function( assert ) {
	var a = new THREE.Sphere( one3.clone(), 1 );

	assert.ok( ( a.distanceToPoint( zero3 ) - 0.7320 ) < 0.001, "Passed!" );
	assert.ok( a.distanceToPoint( one3 ) === -1, "Passed!" );
});

QUnit.test( "intersectsSphere" , function( assert ) {
	var a = new THREE.Sphere( one3.clone(), 1 );
	var b = new THREE.Sphere( zero3.clone(), 1 );
	var c = new THREE.Sphere( zero3.clone(), 0.25 );

	assert.ok( a.intersectsSphere( b ) , "Passed!" );
	assert.ok( ! a.intersectsSphere( c ) , "Passed!" );
});

QUnit.test( "intersectsPlane" , function( assert ) {
	var a = new THREE.Sphere( zero3.clone(), 1 );
	var b = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 1 );
	var c = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 1.25 );
	var d = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 1.25 );

	assert.ok( a.intersectsPlane( b ) , "Passed!" );
	assert.ok( ! a.intersectsPlane( c ) , "Passed!" );
	assert.ok( ! a.intersectsPlane( d ) , "Passed!" );
});

QUnit.test( "clampPoint" , function( assert ) {
	var a = new THREE.Sphere( one3.clone(), 1 );

	assert.ok( a.clampPoint( new THREE.Vector3( 1, 1, 3 ) ).equals( new THREE.Vector3( 1, 1, 2 ) ), "Passed!" );
	assert.ok( a.clampPoint( new THREE.Vector3( 1, 1, -3 ) ).equals( new THREE.Vector3( 1, 1, 0 ) ), "Passed!" );
});

QUnit.test( "getBoundingBox" , function( assert ) {
	var a = new THREE.Sphere( one3.clone(), 1 );

	assert.ok( a.getBoundingBox().equals( new THREE.Box3( zero3, two3 ) ), "Passed!" );

	a.set( zero3, 0 );
	assert.ok( a.getBoundingBox().equals( new THREE.Box3( zero3, zero3 ) ), "Passed!" );
});

QUnit.test( "applyMatrix4" , function( assert ) {
	var a = new THREE.Sphere( one3.clone(), 1 );

	var m = new THREE.Matrix4().makeTranslation( 1, -2, 1 );

	assert.ok( a.clone().applyMatrix4( m ).getBoundingBox().equals( a.getBoundingBox().applyMatrix4( m ) ), "Passed!" );
});

QUnit.test( "translate" , function( assert ) {
	var a = new THREE.Sphere( one3.clone(), 1 );

	a.translate( one3.clone().negate() );
	assert.ok( a.center.equals( zero3 ), "Passed!" );
});
