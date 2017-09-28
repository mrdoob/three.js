/**
 * @author moraxy / https://github.com/moraxy
 */

QUnit.module( "Cylindrical" );

QUnit.test( "constructor", function ( assert ) {

	var a = new THREE.Cylindrical();
	var radius = 10.0;
	var theta = Math.PI;
	var y = 5;

	assert.strictEqual( a.radius, 1.0, "Default values: check radius" );
	assert.strictEqual( a.theta, 0, "Default values: check theta" );
	assert.strictEqual( a.y, 0, "Default values: check y" );

	a = new THREE.Cylindrical( radius, theta, y );
	assert.strictEqual( a.radius, radius, "Custom values: check radius" );
	assert.strictEqual( a.theta, theta, "Custom values: check theta" );
	assert.strictEqual( a.y, y, "Custom values: check y" );

} );

QUnit.test( "set", function ( assert ) {

	var a = new THREE.Cylindrical();
	var radius = 10.0;
	var theta = Math.PI;
	var y = 5;

	a.set( radius, theta, y );
	assert.strictEqual( a.radius, radius, "Check radius" );
	assert.strictEqual( a.theta, theta, "Check theta" );
	assert.strictEqual( a.y, y, "Check y" );

} );

QUnit.test( "clone", function ( assert ) {

	var radius = 10.0;
	var theta = Math.PI;
	var y = 5;
	var a = new THREE.Cylindrical( radius, theta, y );
	var b = a.clone();

	assert.propEqual( a, b, "Check a and b are equal after clone()" );

	a.radius = 1;
	assert.notPropEqual( a, b, "Check a and b are not equal after modification" );

} );

QUnit.test( "copy", function ( assert ) {

	var radius = 10.0;
	var theta = Math.PI;
	var y = 5;
	var a = new THREE.Cylindrical( radius, theta, y );
	var b = new THREE.Cylindrical().copy( a );

	assert.propEqual( a, b, "Check a and b are equal after copy()" );

	a.radius = 1;
	assert.notPropEqual( a, b, "Check a and b are not equal after modification" );

} );

QUnit.test( "setFromVector3", function ( assert ) {

	var a = new THREE.Cylindrical( 1, 1, 1 );
	var b = new THREE.Vector3( 0, 0, 0 );
	var c = new THREE.Vector3( 3, - 1, - 3 );
	var expected = new THREE.Cylindrical( Math.sqrt( 9 + 9 ), Math.atan2( 3, - 3 ), - 1 );

	a.setFromVector3( b );
	assert.strictEqual( a.radius, 0, "Zero-length vector: check radius" );
	assert.strictEqual( a.theta, 0, "Zero-length vector: check theta" );
	assert.strictEqual( a.y, 0, "Zero-length vector: check y" );

	a.setFromVector3( c );
	assert.ok( Math.abs( a.radius - expected.radius ) <= eps, "Normal vector: check radius" );
	assert.ok( Math.abs( a.theta - expected.theta ) <= eps, "Normal vector: check theta" );
	assert.ok( Math.abs( a.y - expected.y ) <= eps, "Normal vector: check y" );

} );
