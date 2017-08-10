/**
 * @author bhouston / http://exocortex.com
 */

QUnit.module( "Vector2" );

QUnit.test( "constructor" , function( assert ) {
	var a = new THREE.Vector2();
	assert.ok( a.x == 0, "Passed!" );
	assert.ok( a.y == 0, "Passed!" );

	a = new THREE.Vector2( x, y );
	assert.ok( a.x === x, "Passed!" );
	assert.ok( a.y === y, "Passed!" );
});

QUnit.test( "copy" , function( assert ) {
	var a = new THREE.Vector2( x, y );
	var b = new THREE.Vector2().copy( a );
	assert.ok( b.x == x, "Passed!" );
	assert.ok( b.y == y, "Passed!" );

	// ensure that it is a true copy
	a.x = 0;
	a.y = -1;
	assert.ok( b.x == x, "Passed!" );
	assert.ok( b.y == y, "Passed!" );
});

QUnit.test( "set" , function( assert ) {
	var a = new THREE.Vector2();
	assert.ok( a.x == 0, "Passed!" );
	assert.ok( a.y == 0, "Passed!" );

	a.set( x, y );
	assert.ok( a.x == x, "Passed!" );
	assert.ok( a.y == y, "Passed!" );
});

QUnit.test( "setX,setY", function( assert ) {
	var a = new THREE.Vector2();
	assert.ok( a.x == 0, "Passed!" );
	assert.ok( a.y == 0, "Passed!" );

	a.setX( x );
	a.setY( y );
	assert.ok( a.x == x, "Passed!" );
	assert.ok( a.y == y, "Passed!" );
});

QUnit.test( "setComponent,getComponent", function( assert ) {
	var a = new THREE.Vector2();
	assert.ok( a.x == 0, "Passed!" );
	assert.ok( a.y == 0, "Passed!" );

	a.setComponent( 0, 1 );
	a.setComponent( 1, 2 );
	assert.ok( a.getComponent( 0 ) == 1, "Passed!" );
	assert.ok( a.getComponent( 1 ) == 2, "Passed!" );
});

QUnit.test( "add" , function( assert ) {
	var a = new THREE.Vector2( x, y );
	var b = new THREE.Vector2( -x, -y );

	a.add( b );
	assert.ok( a.x == 0, "Passed!" );
	assert.ok( a.y == 0, "Passed!" );

	var c = new THREE.Vector2().addVectors( b, b );
	assert.ok( c.x == -2*x, "Passed!" );
	assert.ok( c.y == -2*y, "Passed!" );
});

QUnit.test( "sub" , function( assert ) {
	var a = new THREE.Vector2( x, y );
	var b = new THREE.Vector2( -x, -y );

	a.sub( b );
	assert.ok( a.x == 2*x, "Passed!" );
	assert.ok( a.y == 2*y, "Passed!" );

	var c = new THREE.Vector2().subVectors( a, a );
	assert.ok( c.x == 0, "Passed!" );
	assert.ok( c.y == 0, "Passed!" );
});

QUnit.test( "multiply/divide", function( assert ) {
	var a = new THREE.Vector2( x, y );
	var b = new THREE.Vector2( -x, -y );

	a.multiplyScalar( -2 );
	assert.ok( a.x == x*-2, "Passed!" );
	assert.ok( a.y == y*-2, "Passed!" );

	b.multiplyScalar( -2 );
	assert.ok( b.x == 2*x, "Passed!" );
	assert.ok( b.y == 2*y, "Passed!" );

	a.divideScalar( -2 );
	assert.ok( a.x == x, "Passed!" );
	assert.ok( a.y == y, "Passed!" );

	b.divideScalar( -2 );
	assert.ok( b.x == -x, "Passed!" );
	assert.ok( b.y == -y, "Passed!" );
});


QUnit.test( "min/max/clamp", function( assert ) {
	var a = new THREE.Vector2( x, y );
	var b = new THREE.Vector2( -x, -y );
	var c = new THREE.Vector2();

	c.copy( a ).min( b );
	assert.ok( c.x == -x, "Passed!" );
	assert.ok( c.y == -y, "Passed!" );

	c.copy( a ).max( b );
	assert.ok( c.x == x, "Passed!" );
	assert.ok( c.y == y, "Passed!" );

	c.set( -2*x, 2*y );
	c.clamp( b, a );
	assert.ok( c.x == -x, "Passed!" );
	assert.ok( c.y == y, "Passed!" );

	c.set(-2*x, 2*x);
	c.clampScalar( -x, x );
	assert.equal( c.x, -x, "scalar clamp x" );
	assert.equal( c.y,  x, "scalar clamp y" );
});

QUnit.test( "rounding" , function( assert ) {
	assert.deepEqual( new THREE.Vector2( -0.1, 0.1 ).floor(), new THREE.Vector2( -1, 0 ), "floor .1" );
	assert.deepEqual( new THREE.Vector2( -0.5, 0.5 ).floor(), new THREE.Vector2( -1, 0 ), "floor .5" );
	assert.deepEqual( new THREE.Vector2( -0.9, 0.9 ).floor(), new THREE.Vector2( -1, 0 ), "floor .9" );

	assert.deepEqual( new THREE.Vector2( -0.1, 0.1 ).ceil(), new THREE.Vector2( 0, 1 ), "ceil .1" );
	assert.deepEqual( new THREE.Vector2( -0.5, 0.5 ).ceil(), new THREE.Vector2( 0, 1 ), "ceil .5" );
	assert.deepEqual( new THREE.Vector2( -0.9, 0.9 ).ceil(), new THREE.Vector2( 0, 1 ), "ceil .9" );

	assert.deepEqual( new THREE.Vector2( -0.1, 0.1 ).round(), new THREE.Vector2( 0, 0 ), "round .1" );
	assert.deepEqual( new THREE.Vector2( -0.5, 0.5 ).round(), new THREE.Vector2( 0, 1 ), "round .5" );
	assert.deepEqual( new THREE.Vector2( -0.9, 0.9 ).round(), new THREE.Vector2( -1, 1 ), "round .9" );

	assert.deepEqual( new THREE.Vector2( -0.1, 0.1 ).roundToZero(), new THREE.Vector2( 0, 0 ), "roundToZero .1" );
	assert.deepEqual( new THREE.Vector2( -0.5, 0.5 ).roundToZero(), new THREE.Vector2( 0, 0 ), "roundToZero .5" );
	assert.deepEqual( new THREE.Vector2( -0.9, 0.9 ).roundToZero(), new THREE.Vector2( 0, 0 ), "roundToZero .9" );
	assert.deepEqual( new THREE.Vector2( -1.1, 1.1 ).roundToZero(), new THREE.Vector2( -1, 1 ), "roundToZero 1.1" );
	assert.deepEqual( new THREE.Vector2( -1.5, 1.5 ).roundToZero(), new THREE.Vector2( -1, 1 ), "roundToZero 1.5" );
	assert.deepEqual( new THREE.Vector2( -1.9, 1.9 ).roundToZero(), new THREE.Vector2( -1, 1 ), "roundToZero 1.9" );
});

QUnit.test( "negate" , function( assert ) {
	var a = new THREE.Vector2( x, y );

	a.negate();
	assert.ok( a.x == -x, "Passed!" );
	assert.ok( a.y == -y, "Passed!" );
});

QUnit.test( "dot" , function( assert ) {
	var a = new THREE.Vector2( x, y );
	var b = new THREE.Vector2( -x, -y );
	var c = new THREE.Vector2();

	var result = a.dot( b );
	assert.ok( result == (-x*x-y*y), "Passed!" );

	result = a.dot( c );
	assert.ok( result == 0, "Passed!" );
});

QUnit.test( "length/lengthSq", function( assert ) {
	var a = new THREE.Vector2( x, 0 );
	var b = new THREE.Vector2( 0, -y );
	var c = new THREE.Vector2();

	assert.ok( a.length() == x, "Passed!" );
	assert.ok( a.lengthSq() == x*x, "Passed!" );
	assert.ok( b.length() == y, "Passed!" );
	assert.ok( b.lengthSq() == y*y, "Passed!" );
	assert.ok( c.length() == 0, "Passed!" );
	assert.ok( c.lengthSq() == 0, "Passed!" );

	a.set( x, y );
	assert.ok( a.length() == Math.sqrt( x*x + y*y ), "Passed!" );
	assert.ok( a.lengthSq() == ( x*x + y*y ), "Passed!" );
});

QUnit.test( "normalize" , function( assert ) {
	var a = new THREE.Vector2( x, 0 );
	var b = new THREE.Vector2( 0, -y );
	var c = new THREE.Vector2();

	a.normalize();
	assert.ok( a.length() == 1, "Passed!" );
	assert.ok( a.x == 1, "Passed!" );

	b.normalize();
	assert.ok( b.length() == 1, "Passed!" );
	assert.ok( b.y == -1, "Passed!" );
});

QUnit.test( "distanceTo/distanceToSquared", function( assert ) {
	var a = new THREE.Vector2( x, 0 );
	var b = new THREE.Vector2( 0, -y );
	var c = new THREE.Vector2();

	assert.ok( a.distanceTo( c ) == x, "Passed!" );
	assert.ok( a.distanceToSquared( c ) == x*x, "Passed!" );

	assert.ok( b.distanceTo( c ) == y, "Passed!" );
	assert.ok( b.distanceToSquared( c ) == y*y, "Passed!" );
});

QUnit.test( "setLength" , function( assert ) {
	var a = new THREE.Vector2( x, 0 );

	assert.ok( a.length() == x, "Passed!" );
	a.setLength( y );
	assert.ok( a.length() == y, "Passed!" );

	a = new THREE.Vector2( 0, 0 );
	assert.ok( a.length() == 0, "Passed!" );
	a.setLength( y );
	assert.ok( isNaN( a.length() ), "Passed!" );
});

QUnit.test( "lerp/clone", function( assert ) {
	var a = new THREE.Vector2( x, 0 );
	var b = new THREE.Vector2( 0, -y );

	assert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 0.5 ) ), "Passed!" );
	assert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 1 ) ), "Passed!" );

	assert.ok( a.clone().lerp( b, 0 ).equals( a ), "Passed!" );

	assert.ok( a.clone().lerp( b, 0.5 ).x == x*0.5, "Passed!" );
	assert.ok( a.clone().lerp( b, 0.5 ).y == -y*0.5, "Passed!" );

	assert.ok( a.clone().lerp( b, 1 ).equals( b ), "Passed!" );
});

QUnit.test( "equals" , function( assert ) {
	var a = new THREE.Vector2( x, 0 );
	var b = new THREE.Vector2( 0, -y );

	assert.ok( a.x != b.x, "Passed!" );
	assert.ok( a.y != b.y, "Passed!" );

	assert.ok( ! a.equals( b ), "Passed!" );
	assert.ok( ! b.equals( a ), "Passed!" );

	a.copy( b );
	assert.ok( a.x == b.x, "Passed!" );
	assert.ok( a.y == b.y, "Passed!" );

	assert.ok( a.equals( b ), "Passed!" );
	assert.ok( b.equals( a ), "Passed!" );
});
