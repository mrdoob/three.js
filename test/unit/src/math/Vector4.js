/**
 * @author bhouston / http://exocortex.com
 */

QUnit.module( "Vector4" );

QUnit.test( "constructor" , function( assert ) {
	var a = new THREE.Vector4();
	assert.ok( a.x == 0, "Passed!" );
	assert.ok( a.y == 0, "Passed!" );
	assert.ok( a.z == 0, "Passed!" );
	assert.ok( a.w == 1, "Passed!" );

	a = new THREE.Vector4( x, y, z, w );
	assert.ok( a.x === x, "Passed!" );
	assert.ok( a.y === y, "Passed!" );
	assert.ok( a.z === z, "Passed!" );
	assert.ok( a.w === w, "Passed!" );
});

QUnit.test( "copy" , function( assert ) {
	var a = new THREE.Vector4( x, y, z, w );
	var b = new THREE.Vector4().copy( a );
	assert.ok( b.x == x, "Passed!" );
	assert.ok( b.y == y, "Passed!" );
	assert.ok( b.z == z, "Passed!" );
	assert.ok( b.w == w, "Passed!" );

	// ensure that it is a true copy
	a.x = 0;
	a.y = -1;
	a.z = -2;
	a.w = -3;
	assert.ok( b.x == x, "Passed!" );
	assert.ok( b.y == y, "Passed!" );
	assert.ok( b.z == z, "Passed!" );
	assert.ok( b.w == w, "Passed!" );
});

QUnit.test( "set" , function( assert ) {
	var a = new THREE.Vector4();
	assert.ok( a.x == 0, "Passed!" );
	assert.ok( a.y == 0, "Passed!" );
	assert.ok( a.z == 0, "Passed!" );
	assert.ok( a.w == 1, "Passed!" );

	a.set( x, y, z, w );
	assert.ok( a.x == x, "Passed!" );
	assert.ok( a.y == y, "Passed!" );
	assert.ok( a.z == z, "Passed!" );
	assert.ok( a.w == w, "Passed!" );
});

QUnit.test( "setX,setY,setZ,setW", function( assert ) {
	var a = new THREE.Vector4();
	assert.ok( a.x == 0, "Passed!" );
	assert.ok( a.y == 0, "Passed!" );
	assert.ok( a.z == 0, "Passed!" );
	assert.ok( a.w == 1, "Passed!" );

	a.setX( x );
	a.setY( y );
	a.setZ( z );
	a.setW( w );

	assert.ok( a.x == x, "Passed!" );
	assert.ok( a.y == y, "Passed!" );
	assert.ok( a.z == z, "Passed!" );
	assert.ok( a.w == w, "Passed!" );
});

QUnit.test( "setComponent,getComponent", function( assert ) {
	var a = new THREE.Vector4();
	assert.ok( a.x == 0, "Passed!" );
	assert.ok( a.y == 0, "Passed!" );
	assert.ok( a.z == 0, "Passed!" );
	assert.ok( a.w == 1, "Passed!" );

	a.setComponent( 0, 1 );
	a.setComponent( 1, 2 );
	a.setComponent( 2, 3 );
	a.setComponent( 3, 4 );
	assert.ok( a.getComponent( 0 ) == 1, "Passed!" );
	assert.ok( a.getComponent( 1 ) == 2, "Passed!" );
	assert.ok( a.getComponent( 2 ) == 3, "Passed!" );
	assert.ok( a.getComponent( 3 ) == 4, "Passed!" );
});

QUnit.test( "add" , function( assert ) {
	var a = new THREE.Vector4( x, y, z, w );
	var b = new THREE.Vector4( -x, -y, -z, -w );

	a.add( b );
	assert.ok( a.x == 0, "Passed!" );
	assert.ok( a.y == 0, "Passed!" );
	assert.ok( a.z == 0, "Passed!" );
	assert.ok( a.w == 0, "Passed!" );

	var c = new THREE.Vector4().addVectors( b, b );
	assert.ok( c.x == -2*x, "Passed!" );
	assert.ok( c.y == -2*y, "Passed!" );
	assert.ok( c.z == -2*z, "Passed!" );
	assert.ok( c.w == -2*w, "Passed!" );
});

QUnit.test( "sub" , function( assert ) {
	var a = new THREE.Vector4( x, y, z, w );
	var b = new THREE.Vector4( -x, -y, -z, -w );

	a.sub( b );
	assert.ok( a.x == 2*x, "Passed!" );
	assert.ok( a.y == 2*y, "Passed!" );
	assert.ok( a.z == 2*z, "Passed!" );
	assert.ok( a.w == 2*w, "Passed!" );

	var c = new THREE.Vector4().subVectors( a, a );
	assert.ok( c.x == 0, "Passed!" );
	assert.ok( c.y == 0, "Passed!" );
	assert.ok( c.z == 0, "Passed!" );
	assert.ok( c.w == 0, "Passed!" );
});

QUnit.test( "multiply/divide", function( assert ) {
	var a = new THREE.Vector4( x, y, z, w );
	var b = new THREE.Vector4( -x, -y, -z, -w );

	a.multiplyScalar( -2 );
	assert.ok( a.x == x*-2, "Passed!" );
	assert.ok( a.y == y*-2, "Passed!" );
	assert.ok( a.z == z*-2, "Passed!" );
	assert.ok( a.w == w*-2, "Passed!" );

	b.multiplyScalar( -2 );
	assert.ok( b.x == 2*x, "Passed!" );
	assert.ok( b.y == 2*y, "Passed!" );
	assert.ok( b.z == 2*z, "Passed!" );
	assert.ok( b.w == 2*w, "Passed!" );

	a.divideScalar( -2 );
	assert.ok( a.x == x, "Passed!" );
	assert.ok( a.y == y, "Passed!" );
	assert.ok( a.z == z, "Passed!" );
	assert.ok( a.w == w, "Passed!" );

	b.divideScalar( -2 );
	assert.ok( b.x == -x, "Passed!" );
	assert.ok( b.y == -y, "Passed!" );
	assert.ok( b.z == -z, "Passed!" );
	assert.ok( b.w == -w, "Passed!" );
});

QUnit.test( "min/max/clamp", function( assert ) {
	var a = new THREE.Vector4( x, y, z, w );
	var b = new THREE.Vector4( -x, -y, -z, -w );
	var c = new THREE.Vector4();

	c.copy( a ).min( b );
	assert.ok( c.x == -x, "Passed!" );
	assert.ok( c.y == -y, "Passed!" );
	assert.ok( c.z == -z, "Passed!" );
	assert.ok( c.w == -w, "Passed!" );

	c.copy( a ).max( b );
	assert.ok( c.x == x, "Passed!" );
	assert.ok( c.y == y, "Passed!" );
	assert.ok( c.z == z, "Passed!" );
	assert.ok( c.w == w, "Passed!" );

	c.set( -2*x, 2*y, -2*z, 2*w );
	c.clamp( b, a );
	assert.ok( c.x == -x, "Passed!" );
	assert.ok( c.y == y, "Passed!" );
	assert.ok( c.z == -z, "Passed!" );
	assert.ok( c.w == w, "Passed!" );
});

QUnit.test( "negate" , function( assert ) {
	var a = new THREE.Vector4( x, y, z, w );

	a.negate();
	assert.ok( a.x == -x, "Passed!" );
	assert.ok( a.y == -y, "Passed!" );
	assert.ok( a.z == -z, "Passed!" );
	assert.ok( a.w == -w, "Passed!" );
});

QUnit.test( "dot" , function( assert ) {
	var a = new THREE.Vector4( x, y, z, w );
	var b = new THREE.Vector4( -x, -y, -z, -w );
	var c = new THREE.Vector4( 0, 0, 0, 0 );

	var result = a.dot( b );
	assert.ok( result == (-x*x-y*y-z*z-w*w), "Passed!" );

	result = a.dot( c );
	assert.ok( result == 0, "Passed!" );
});

QUnit.test( "length/lengthSq", function( assert ) {
	var a = new THREE.Vector4( x, 0, 0, 0 );
	var b = new THREE.Vector4( 0, -y, 0, 0 );
	var c = new THREE.Vector4( 0, 0, z, 0 );
	var d = new THREE.Vector4( 0, 0, 0, w );
	var e = new THREE.Vector4( 0, 0, 0, 0 );

	assert.ok( a.length() == x, "Passed!" );
	assert.ok( a.lengthSq() == x*x, "Passed!" );
	assert.ok( b.length() == y, "Passed!" );
	assert.ok( b.lengthSq() == y*y, "Passed!" );
	assert.ok( c.length() == z, "Passed!" );
	assert.ok( c.lengthSq() == z*z, "Passed!" );
	assert.ok( d.length() == w, "Passed!" );
	assert.ok( d.lengthSq() == w*w, "Passed!" );
	assert.ok( e.length() == 0, "Passed!" );
	assert.ok( e.lengthSq() == 0, "Passed!" );

	a.set( x, y, z, w );
	assert.ok( a.length() == Math.sqrt( x*x + y*y + z*z + w*w ), "Passed!" );
	assert.ok( a.lengthSq() == ( x*x + y*y + z*z + w*w ), "Passed!" );
});

QUnit.test( "normalize" , function( assert ) {
	var a = new THREE.Vector4( x, 0, 0, 0 );
	var b = new THREE.Vector4( 0, -y, 0, 0 );
	var c = new THREE.Vector4( 0, 0, z, 0 );
	var d = new THREE.Vector4( 0, 0, 0, -w );

	a.normalize();
	assert.ok( a.length() == 1, "Passed!" );
	assert.ok( a.x == 1, "Passed!" );

	b.normalize();
	assert.ok( b.length() == 1, "Passed!" );
	assert.ok( b.y == -1, "Passed!" );

	c.normalize();
	assert.ok( c.length() == 1, "Passed!" );
	assert.ok( c.z == 1, "Passed!" );

	d.normalize();
	assert.ok( d.length() == 1, "Passed!" );
	assert.ok( d.w == -1, "Passed!" );
});

/*
QUnit.test( "distanceTo/distanceToSquared", function() {
	var a = new THREE.Vector4( x, 0, 0, 0 );
	var b = new THREE.Vector4( 0, -y, 0, 0 );
	var c = new THREE.Vector4( 0, 0, z, 0 );
	var d = new THREE.Vector4( 0, 0, 0, -w );
	var e = new THREE.Vector4();

	ok( a.distanceTo( e ) == x, "Passed!" );
	ok( a.distanceToSquared( e ) == x*x, "Passed!" );

	ok( b.distanceTo( e ) == y, "Passed!" );
	ok( b.distanceToSquared( e ) == y*y, "Passed!" );

	ok( c.distanceTo( e ) == z, "Passed!" );
	ok( c.distanceToSquared( e ) == z*z, "Passed!" );

	ok( d.distanceTo( e ) == w, "Passed!" );
	ok( d.distanceToSquared( e ) == w*w, "Passed!" );
});
*/


QUnit.test( "setLength" , function( assert ) {
	var a = new THREE.Vector4( x, 0, 0, 0 );

	assert.ok( a.length() == x, "Passed!" );
	a.setLength( y );
	assert.ok( a.length() == y, "Passed!" );

	a = new THREE.Vector4( 0, 0, 0, 0 );
	assert.ok( a.length() == 0, "Passed!" );
	a.setLength( y );
	assert.ok( isNaN( a.length() ), "Passed!" );
});

QUnit.test( "lerp/clone", function( assert ) {
	var a = new THREE.Vector4( x, 0, z, 0 );
	var b = new THREE.Vector4( 0, -y, 0, -w );

	assert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 0.5 ) ), "Passed!" );
	assert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 1 ) ), "Passed!" );

	assert.ok( a.clone().lerp( b, 0 ).equals( a ), "Passed!" );

	assert.ok( a.clone().lerp( b, 0.5 ).x == x*0.5, "Passed!" );
	assert.ok( a.clone().lerp( b, 0.5 ).y == -y*0.5, "Passed!" );
	assert.ok( a.clone().lerp( b, 0.5 ).z == z*0.5, "Passed!" );
	assert.ok( a.clone().lerp( b, 0.5 ).w == -w*0.5, "Passed!" );

	assert.ok( a.clone().lerp( b, 1 ).equals( b ), "Passed!" );
});

QUnit.test( "equals" , function( assert ) {
	var a = new THREE.Vector4( x, 0, z, 0 );
	var b = new THREE.Vector4( 0, -y, 0, -w );

	assert.ok( a.x != b.x, "Passed!" );
	assert.ok( a.y != b.y, "Passed!" );
	assert.ok( a.z != b.z, "Passed!" );
	assert.ok( a.w != b.w, "Passed!" );

	assert.ok( ! a.equals( b ), "Passed!" );
	assert.ok( ! b.equals( a ), "Passed!" );

	a.copy( b );
	assert.ok( a.x == b.x, "Passed!" );
	assert.ok( a.y == b.y, "Passed!" );
	assert.ok( a.z == b.z, "Passed!" );
	assert.ok( a.w == b.w, "Passed!" );

	assert.ok( a.equals( b ), "Passed!" );
	assert.ok( b.equals( a ), "Passed!" );
});
