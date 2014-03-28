/**
 * @author bhouston / http://exocortex.com
 */

module( "Vector2" );

test( "constructor", function() {
	var a = new THREE.Vector2();
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );

	a = new THREE.Vector2( x, y );
	ok( a.x === x, "Passed!" );
	ok( a.y === y, "Passed!" );
});

test( "copy", function() {
	var a = new THREE.Vector2( x, y );
	var b = new THREE.Vector2().copy( a );
	ok( b.x == x, "Passed!" );
	ok( b.y == y, "Passed!" );

	// ensure that it is a true copy
	a.x = 0;
	a.y = -1;
	ok( b.x == x, "Passed!" );
	ok( b.y == y, "Passed!" );
});

test( "set", function() {
	var a = new THREE.Vector2();
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );

	a.set( x, y );
	ok( a.x == x, "Passed!" );
	ok( a.y == y, "Passed!" );
});

test( "setX,setY", function() {
	var a = new THREE.Vector2();
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );

	a.setX( x );
	a.setY( y );
	ok( a.x == x, "Passed!" );
	ok( a.y == y, "Passed!" );
});

test( "setComponent,getComponent", function() {
	var a = new THREE.Vector2();
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );

	a.setComponent( 0, 1 );
	a.setComponent( 1, 2 );
	ok( a.getComponent( 0 ) == 1, "Passed!" );
	ok( a.getComponent( 1 ) == 2, "Passed!" );
});

test( "add", function() {
	var a = new THREE.Vector2( x, y );
	var b = new THREE.Vector2( -x, -y );

	a.add( b );
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );

	var c = new THREE.Vector2().addVectors( b, b );
	ok( c.x == -2*x, "Passed!" );
	ok( c.y == -2*y, "Passed!" );
});

test( "sub", function() {
	var a = new THREE.Vector2( x, y );
	var b = new THREE.Vector2( -x, -y );

	a.sub( b );
	ok( a.x == 2*x, "Passed!" );
	ok( a.y == 2*y, "Passed!" );

	var c = new THREE.Vector2().subVectors( a, a );
	ok( c.x == 0, "Passed!" );
	ok( c.y == 0, "Passed!" );
});

test( "multiply/divide", function() {
	var a = new THREE.Vector2( x, y );
	var b = new THREE.Vector2( -x, -y );

	a.multiplyScalar( -2 );
	ok( a.x == x*-2, "Passed!" );
	ok( a.y == y*-2, "Passed!" );

	b.multiplyScalar( -2 );
	ok( b.x == 2*x, "Passed!" );
	ok( b.y == 2*y, "Passed!" );

	a.divideScalar( -2 );
	ok( a.x == x, "Passed!" );
	ok( a.y == y, "Passed!" );

	b.divideScalar( -2 );
	ok( b.x == -x, "Passed!" );
	ok( b.y == -y, "Passed!" );
});


test( "min/max/clamp", function() {
	var a = new THREE.Vector2( x, y );
	var b = new THREE.Vector2( -x, -y );
	var c = new THREE.Vector2();

	c.copy( a ).min( b );
	ok( c.x == -x, "Passed!" );
	ok( c.y == -y, "Passed!" );

	c.copy( a ).max( b );
	ok( c.x == x, "Passed!" );
	ok( c.y == y, "Passed!" );

	c.set( -2*x, 2*y );
	c.clamp( b, a );
	ok( c.x == -x, "Passed!" );
	ok( c.y == y, "Passed!" );

	c.set(-2*x, 2*x);
	c.clampScalar( -x, x );
	equal( c.x, -x, "scalar clamp x" );
	equal( c.y,  x, "scalar clamp y" );
});

test( "rounding", function() {
	deepEqual( new THREE.Vector2( -0.1, 0.1 ).floor(), new THREE.Vector2( -1, 0 ), "floor .1" );
	deepEqual( new THREE.Vector2( -0.5, 0.5 ).floor(), new THREE.Vector2( -1, 0 ), "floor .5" );
	deepEqual( new THREE.Vector2( -0.9, 0.9 ).floor(), new THREE.Vector2( -1, 0 ), "floor .9" );

	deepEqual( new THREE.Vector2( -0.1, 0.1 ).ceil(), new THREE.Vector2( 0, 1 ), "ceil .1" );
	deepEqual( new THREE.Vector2( -0.5, 0.5 ).ceil(), new THREE.Vector2( 0, 1 ), "ceil .5" );
	deepEqual( new THREE.Vector2( -0.9, 0.9 ).ceil(), new THREE.Vector2( 0, 1 ), "ceil .9" );

	deepEqual( new THREE.Vector2( -0.1, 0.1 ).round(), new THREE.Vector2( 0, 0 ), "round .1" );
	deepEqual( new THREE.Vector2( -0.5, 0.5 ).round(), new THREE.Vector2( 0, 1 ), "round .5" );
	deepEqual( new THREE.Vector2( -0.9, 0.9 ).round(), new THREE.Vector2( -1, 1 ), "round .9" );

	deepEqual( new THREE.Vector2( -0.1, 0.1 ).roundToZero(), new THREE.Vector2( 0, 0 ), "roundToZero .1" );
	deepEqual( new THREE.Vector2( -0.5, 0.5 ).roundToZero(), new THREE.Vector2( 0, 0 ), "roundToZero .5" );
	deepEqual( new THREE.Vector2( -0.9, 0.9 ).roundToZero(), new THREE.Vector2( 0, 0 ), "roundToZero .9" );
	deepEqual( new THREE.Vector2( -1.1, 1.1 ).roundToZero(), new THREE.Vector2( -1, 1 ), "roundToZero 1.1" );
	deepEqual( new THREE.Vector2( -1.5, 1.5 ).roundToZero(), new THREE.Vector2( -1, 1 ), "roundToZero 1.5" );
	deepEqual( new THREE.Vector2( -1.9, 1.9 ).roundToZero(), new THREE.Vector2( -1, 1 ), "roundToZero 1.9" );
});

test( "negate", function() {
	var a = new THREE.Vector2( x, y );

	a.negate();
	ok( a.x == -x, "Passed!" );
	ok( a.y == -y, "Passed!" );
});

test( "dot", function() {
	var a = new THREE.Vector2( x, y );
	var b = new THREE.Vector2( -x, -y );
	var c = new THREE.Vector2();

	var result = a.dot( b );
	ok( result == (-x*x-y*y), "Passed!" );

	result = a.dot( c );
	ok( result == 0, "Passed!" );
});

test( "length/lengthSq", function() {
	var a = new THREE.Vector2( x, 0 );
	var b = new THREE.Vector2( 0, -y );
	var c = new THREE.Vector2();

	ok( a.length() == x, "Passed!" );
	ok( a.lengthSq() == x*x, "Passed!" );
	ok( b.length() == y, "Passed!" );
	ok( b.lengthSq() == y*y, "Passed!" );
	ok( c.length() == 0, "Passed!" );
	ok( c.lengthSq() == 0, "Passed!" );

	a.set( x, y );
	ok( a.length() == Math.sqrt( x*x + y*y ), "Passed!" );
	ok( a.lengthSq() == ( x*x + y*y ), "Passed!" );
});

test( "normalize", function() {
	var a = new THREE.Vector2( x, 0 );
	var b = new THREE.Vector2( 0, -y );
	var c = new THREE.Vector2();

	a.normalize();
	ok( a.length() == 1, "Passed!" );
	ok( a.x == 1, "Passed!" );

	b.normalize();
	ok( b.length() == 1, "Passed!" );
	ok( b.y == -1, "Passed!" );
});

test( "distanceTo/distanceToSquared", function() {
	var a = new THREE.Vector2( x, 0 );
	var b = new THREE.Vector2( 0, -y );
	var c = new THREE.Vector2();

	ok( a.distanceTo( c ) == x, "Passed!" );
	ok( a.distanceToSquared( c ) == x*x, "Passed!" );

	ok( b.distanceTo( c ) == y, "Passed!" );
	ok( b.distanceToSquared( c ) == y*y, "Passed!" );
});

test( "setLength", function() {
	var a = new THREE.Vector2( x, 0 );

	ok( a.length() == x, "Passed!" );
	a.setLength( y );
	ok( a.length() == y, "Passed!" );

	a = new THREE.Vector2( 0, 0 );
	ok( a.length() == 0, "Passed!" );
	a.setLength( y );
	ok( a.length() == 0, "Passed!" );
});

test( "lerp/clone", function() {
	var a = new THREE.Vector2( x, 0 );
	var b = new THREE.Vector2( 0, -y );

	ok( a.lerp( a, 0 ).equals( a.lerp( a, 0.5 ) ), "Passed!" );
	ok( a.lerp( a, 0 ).equals( a.lerp( a, 1 ) ), "Passed!" );

	ok( a.clone().lerp( b, 0 ).equals( a ), "Passed!" );

	ok( a.clone().lerp( b, 0.5 ).x == x*0.5, "Passed!" );
	ok( a.clone().lerp( b, 0.5 ).y == -y*0.5, "Passed!" );

	ok( a.clone().lerp( b, 1 ).equals( b ), "Passed!" );
});

test( "equals", function() {
	var a = new THREE.Vector2( x, 0 );
	var b = new THREE.Vector2( 0, -y );

	ok( a.x != b.x, "Passed!" );
	ok( a.y != b.y, "Passed!" );

	ok( ! a.equals( b ), "Passed!" );
	ok( ! b.equals( a ), "Passed!" );

	a.copy( b );
	ok( a.x == b.x, "Passed!" );
	ok( a.y == b.y, "Passed!" );

	ok( a.equals( b ), "Passed!" );
	ok( b.equals( a ), "Passed!" );
});
