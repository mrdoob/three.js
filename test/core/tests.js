var x = 1;
var y = 2;
var z = 3;
var w = 4;

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

	a.set( x, y )
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

test( "add", function() {
	var a = new THREE.Vector2( x, y );
	var b = new THREE.Vector2( -x, -y );

	a.addSelf( b );
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );

	var c = new THREE.Vector2().add( b, b );
	ok( c.x == -2*x, "Passed!" );
	ok( c.y == -2*y, "Passed!" );	
});

test( "sub", function() {
	var a = new THREE.Vector2( x, y );
	var b = new THREE.Vector2( -x, -y );

	a.subSelf( b );
	ok( a.x == 2*x, "Passed!" );
	ok( a.y == 2*y, "Passed!" );

	var c = new THREE.Vector2().sub( a, a );
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

	c.copy( a ).minSelf( b );
	ok( c.x == -x, "Passed!" );
	ok( c.y == -y, "Passed!" );

	c.copy( a ).maxSelf( b );
	ok( c.x == x, "Passed!" );
	ok( c.y == y, "Passed!" );

	c.set( -2*x, 2*y );
	c.clampSelf( b, a );
	ok( c.x == -x, "Passed!" );
	ok( c.y == y, "Passed!" );	
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
	ok( result == (x*x+y*y), "Passed!" );

	result = a.dot( c );
	ok( result == 0, "Passed!" );
});

