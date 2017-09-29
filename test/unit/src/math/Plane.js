/**
 * @author bhouston / http://exocortex.com
 */

QUnit.module( "Plane" );

var comparePlane = function ( a, b, threshold ) {
	threshold = threshold || 0.0001;
	return ( a.normal.distanceTo( b.normal ) < threshold &&
	Math.abs( a.constant - b.constant ) < threshold );
};


QUnit.test( "constructor" , function( assert ) {
	var a = new THREE.Plane();
	assert.ok( a.normal.x == 1, "Passed!" );
	assert.ok( a.normal.y == 0, "Passed!" );
	assert.ok( a.normal.z == 0, "Passed!" );
	assert.ok( a.constant == 0, "Passed!" );

	a = new THREE.Plane( one3.clone(), 0 );
	assert.ok( a.normal.x == 1, "Passed!" );
	assert.ok( a.normal.y == 1, "Passed!" );
	assert.ok( a.normal.z == 1, "Passed!" );
	assert.ok( a.constant == 0, "Passed!" );

	a = new THREE.Plane( one3.clone(), 1 );
	assert.ok( a.normal.x == 1, "Passed!" );
	assert.ok( a.normal.y == 1, "Passed!" );
	assert.ok( a.normal.z == 1, "Passed!" );
	assert.ok( a.constant == 1, "Passed!" );
});

QUnit.test( "copy" , function( assert ) {
	var a = new THREE.Plane( new THREE.Vector3( x, y, z ), w );
	var b = new THREE.Plane().copy( a );
	assert.ok( b.normal.x == x, "Passed!" );
	assert.ok( b.normal.y == y, "Passed!" );
	assert.ok( b.normal.z == z, "Passed!" );
	assert.ok( b.constant == w, "Passed!" );

	// ensure that it is a true copy
	a.normal.x = 0;
	a.normal.y = -1;
	a.normal.z = -2;
	a.constant = -3;
	assert.ok( b.normal.x == x, "Passed!" );
	assert.ok( b.normal.y == y, "Passed!" );
	assert.ok( b.normal.z == z, "Passed!" );
	assert.ok( b.constant == w, "Passed!" );
});

QUnit.test( "set" , function( assert ) {
	var a = new THREE.Plane();
	assert.ok( a.normal.x == 1, "Passed!" );
	assert.ok( a.normal.y == 0, "Passed!" );
	assert.ok( a.normal.z == 0, "Passed!" );
	assert.ok( a.constant == 0, "Passed!" );

	var b = a.clone().set( new THREE.Vector3( x, y, z ), w );
	assert.ok( b.normal.x == x, "Passed!" );
	assert.ok( b.normal.y == y, "Passed!" );
	assert.ok( b.normal.z == z, "Passed!" );
	assert.ok( b.constant == w, "Passed!" );
});

QUnit.test( "setComponents" , function( assert ) {
	var a = new THREE.Plane();
	assert.ok( a.normal.x == 1, "Passed!" );
	assert.ok( a.normal.y == 0, "Passed!" );
	assert.ok( a.normal.z == 0, "Passed!" );
	assert.ok( a.constant == 0, "Passed!" );

	var b = a.clone().setComponents( x, y, z , w );
	assert.ok( b.normal.x == x, "Passed!" );
	assert.ok( b.normal.y == y, "Passed!" );
	assert.ok( b.normal.z == z, "Passed!" );
	assert.ok( b.constant == w, "Passed!" );
});

QUnit.test( "setFromNormalAndCoplanarPoint" , function( assert ) {
	var normal = one3.clone().normalize();
	var a = new THREE.Plane().setFromNormalAndCoplanarPoint( normal, zero3 );

	assert.ok( a.normal.equals( normal ), "Passed!" );
	assert.ok( a.constant == 0, "Passed!" );
});

QUnit.test( "normalize" , function( assert ) {
	var a = new THREE.Plane( new THREE.Vector3( 2, 0, 0 ), 2 );

	a.normalize();
	assert.ok( a.normal.length() == 1, "Passed!" );
	assert.ok( a.normal.equals( new THREE.Vector3( 1, 0, 0 ) ), "Passed!" );
	assert.ok( a.constant == 1, "Passed!" );
});

QUnit.test( "negate/distanceToPoint", function( assert ) {
	var a = new THREE.Plane( new THREE.Vector3( 2, 0, 0 ), -2 );

	a.normalize();
	assert.ok( a.distanceToPoint( new THREE.Vector3( 4, 0, 0 ) ) === 3, "Passed!" );
	assert.ok( a.distanceToPoint( new THREE.Vector3( 1, 0, 0 ) ) === 0, "Passed!" );

	a.negate();
	assert.ok( a.distanceToPoint( new THREE.Vector3( 4, 0, 0 ) ) === -3, "Passed!" );
	assert.ok( a.distanceToPoint( new THREE.Vector3( 1, 0, 0 ) ) === 0, "Passed!" );
});

QUnit.test( "distanceToPoint" , function( assert ) {
	var a = new THREE.Plane( new THREE.Vector3( 2, 0, 0 ), -2 );

	a.normalize();
	assert.ok( a.distanceToPoint( a.projectPoint( zero3.clone() ) ) === 0, "Passed!" );
	assert.ok( a.distanceToPoint( new THREE.Vector3( 4, 0, 0 ) ) === 3, "Passed!" );
});

QUnit.test( "distanceToSphere" , function( assert ) {
	var a = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 0 );

	var b = new THREE.Sphere( new THREE.Vector3( 2, 0, 0 ), 1 );

	assert.ok( a.distanceToSphere( b ) === 1, "Passed!" );

	a.set( new THREE.Vector3( 1, 0, 0 ), 2 );
	assert.ok( a.distanceToSphere( b ) === 3, "Passed!" );
	a.set( new THREE.Vector3( 1, 0, 0 ), -2 );
	assert.ok( a.distanceToSphere( b ) === -1, "Passed!" );
});

QUnit.test( "isInterestionLine/intersectLine", function( assert ) {
	var a = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 0 );

	var l1 = new THREE.Line3( new THREE.Vector3( -10, 0, 0 ), new THREE.Vector3( 10, 0, 0 ) );
	assert.ok( a.intersectsLine( l1 ), "Passed!" );
	assert.ok( a.intersectLine( l1 ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );

	a = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), -3 );

	assert.ok( a.intersectsLine( l1 ), "Passed!" );
	assert.ok( a.intersectLine( l1 ).equals( new THREE.Vector3( 3, 0, 0 ) ), "Passed!" );


	a = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), -11 );

	assert.ok( ! a.intersectsLine( l1 ), "Passed!" );
	assert.ok( a.intersectLine( l1 ) === undefined, "Passed!" );

	a = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 11 );

	assert.ok( ! a.intersectsLine( l1 ), "Passed!" );
	assert.ok( a.intersectLine( l1 ) === undefined, "Passed!" );

});

QUnit.test( "projectPoint" , function( assert ) {
	var a = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 0 );

	assert.ok( a.projectPoint( new THREE.Vector3( 10, 0, 0 ) ).equals( zero3 ), "Passed!" );
	assert.ok( a.projectPoint( new THREE.Vector3( -10, 0, 0 ) ).equals( zero3 ), "Passed!" );

	a = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), -1 );
	assert.ok( a.projectPoint( new THREE.Vector3( 0, 0, 0 ) ).equals( new THREE.Vector3( 0, 1, 0 ) ), "Passed!" );
	assert.ok( a.projectPoint( new THREE.Vector3( 0, 1, 0 ) ).equals( new THREE.Vector3( 0, 1, 0 ) ), "Passed!" );

});

QUnit.test( "coplanarPoint" , function( assert ) {
	var a = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 0 );
	assert.ok( a.distanceToPoint( a.coplanarPoint() ) === 0, "Passed!" );

	a = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), -1 );
	assert.ok( a.distanceToPoint( a.coplanarPoint() ) === 0, "Passed!" );
});

QUnit.test( "applyMatrix4/translate", function( assert ) {

	var a = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 0 );

	var m = new THREE.Matrix4();
	m.makeRotationZ( Math.PI * 0.5 );

	assert.ok( comparePlane( a.clone().applyMatrix4( m ), new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 ) ), "Passed!" );

	a = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), -1 );
	assert.ok( comparePlane( a.clone().applyMatrix4( m ), new THREE.Plane( new THREE.Vector3( -1, 0, 0 ), -1 ) ), "Passed!" );

	m.makeTranslation( 1, 1, 1 );
	assert.ok( comparePlane( a.clone().applyMatrix4( m ), a.clone().translate( new THREE.Vector3( 1, 1, 1 ) ) ), "Passed!" );
});

QUnit.test( "equals", function ( assert ) {

	var a = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 0 );
	var b = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 1 );
	var c = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 );

	assert.ok( a.normal.equals( b.normal ), "Normals: equal" );
	assert.notOk( a.normal.equals( c.normal ), "Normals: not equal" );

	assert.notStrictEqual( a.constant, b.constant, "Constants: not equal" );
	assert.strictEqual( a.constant, c.constant, "Constants: equal" );

	assert.notOk( a.equals( b ), "Planes: not equal" );
	assert.notOk( a.equals( c ), "Planes: not equal" );

	a.copy( b );
	assert.ok( a.normal.equals( b.normal ), "Normals after copy(): equal" );
	assert.strictEqual( a.constant, b.constant, "Constants after copy(): equal" );
	assert.ok( a.equals( b ), "Planes after copy(): equal" );

} );

QUnit.test( "setFromCoplanarPoints", function ( assert ) {

	var a = new THREE.Plane();
	var v1 = new THREE.Vector3( 2.0, 0.5, 0.25 );
	var v2 = new THREE.Vector3( 2.0, - 0.5, 1.25 );
	var v3 = new THREE.Vector3( 2.0, - 3.5, 2.2 );
	var normal = new THREE.Vector3( 1, 0, 0 );
	var constant = - 2;

	a.setFromCoplanarPoints( v1, v2, v3 );

	assert.ok( a.normal.equals( normal ), "Check normal" );
	assert.strictEqual( a.constant, constant, "Check constant" );

} );
