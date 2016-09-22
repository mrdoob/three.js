/**
 * @author bhouston / http://exocortex.com
 */

module( "Vector4" );

test( "constructor", function() {
	var a = new THREE.Vector4();
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );
	ok( a.z == 0, "Passed!" );
	ok( a.w == 1, "Passed!" );

	a = new THREE.Vector4( x, y, z, w );
	ok( a.x === x, "Passed!" );
	ok( a.y === y, "Passed!" );
	ok( a.z === z, "Passed!" );
	ok( a.w === w, "Passed!" );
});

test( "copy", function() {
	var a = new THREE.Vector4( x, y, z, w );
	var b = new THREE.Vector4().copy( a );
	ok( b.x == x, "Passed!" );
	ok( b.y == y, "Passed!" );
	ok( b.z == z, "Passed!" );
	ok( b.w == w, "Passed!" );

	// ensure that it is a true copy
	a.x = 0;
	a.y = -1;
	a.z = -2;
	a.w = -3;
	ok( b.x == x, "Passed!" );
	ok( b.y == y, "Passed!" );
	ok( b.z == z, "Passed!" );
	ok( b.w == w, "Passed!" );
});

test( "set", function() {
	var a = new THREE.Vector4();
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );
	ok( a.z == 0, "Passed!" );
	ok( a.w == 1, "Passed!" );

	a.set( x, y, z, w );
	ok( a.x == x, "Passed!" );
	ok( a.y == y, "Passed!" );
	ok( a.z == z, "Passed!" );
	ok( a.w == w, "Passed!" );
});

test( "setX,setY,setZ,setW", function() {
	var a = new THREE.Vector4();
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );
	ok( a.z == 0, "Passed!" );
	ok( a.w == 1, "Passed!" );

	a.setX( x );
	a.setY( y );
	a.setZ( z );
	a.setW( w );

	ok( a.x == x, "Passed!" );
	ok( a.y == y, "Passed!" );
	ok( a.z == z, "Passed!" );
	ok( a.w == w, "Passed!" );
});

test( "setComponent,getComponent", function() {
	var a = new THREE.Vector4();
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );
	ok( a.z == 0, "Passed!" );
	ok( a.w == 1, "Passed!" );

	a.setComponent( 0, 1 );
	a.setComponent( 1, 2 );
	a.setComponent( 2, 3 );
	a.setComponent( 3, 4 );
	ok( a.getComponent( 0 ) == 1, "Passed!" );
	ok( a.getComponent( 1 ) == 2, "Passed!" );
	ok( a.getComponent( 2 ) == 3, "Passed!" );
	ok( a.getComponent( 3 ) == 4, "Passed!" );
});

test( "add", function() {
	var a = new THREE.Vector4( x, y, z, w );
	var b = new THREE.Vector4( -x, -y, -z, -w );

	a.add( b );
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );
	ok( a.z == 0, "Passed!" );
	ok( a.w == 0, "Passed!" );

	var c = new THREE.Vector4().addVectors( b, b );
	ok( c.x == -2*x, "Passed!" );
	ok( c.y == -2*y, "Passed!" );
	ok( c.z == -2*z, "Passed!" );
	ok( c.w == -2*w, "Passed!" );
});

test( "sub", function() {
	var a = new THREE.Vector4( x, y, z, w );
	var b = new THREE.Vector4( -x, -y, -z, -w );

	a.sub( b );
	ok( a.x == 2*x, "Passed!" );
	ok( a.y == 2*y, "Passed!" );
	ok( a.z == 2*z, "Passed!" );
	ok( a.w == 2*w, "Passed!" );

	var c = new THREE.Vector4().subVectors( a, a );
	ok( c.x == 0, "Passed!" );
	ok( c.y == 0, "Passed!" );
	ok( c.z == 0, "Passed!" );
	ok( c.w == 0, "Passed!" );
});

test( "multiply/divide", function() {
	var a = new THREE.Vector4( x, y, z, w );
	var b = new THREE.Vector4( -x, -y, -z, -w );

	a.multiplyScalar( -2 );
	ok( a.x == x*-2, "Passed!" );
	ok( a.y == y*-2, "Passed!" );
	ok( a.z == z*-2, "Passed!" );
	ok( a.w == w*-2, "Passed!" );

	b.multiplyScalar( -2 );
	ok( b.x == 2*x, "Passed!" );
	ok( b.y == 2*y, "Passed!" );	
	ok( b.z == 2*z, "Passed!" );	
	ok( b.w == 2*w, "Passed!" );	

	a.divideScalar( -2 );
	ok( a.x == x, "Passed!" );
	ok( a.y == y, "Passed!" );
	ok( a.z == z, "Passed!" );
	ok( a.w == w, "Passed!" );

	b.divideScalar( -2 );
	ok( b.x == -x, "Passed!" );
	ok( b.y == -y, "Passed!" );
	ok( b.z == -z, "Passed!" );
	ok( b.w == -w, "Passed!" );
});

test( "min/max/clamp", function() {
	var a = new THREE.Vector4( x, y, z, w );
	var b = new THREE.Vector4( -x, -y, -z, -w );
	var c = new THREE.Vector4();

	c.copy( a ).min( b );
	ok( c.x == -x, "Passed!" );
	ok( c.y == -y, "Passed!" );
	ok( c.z == -z, "Passed!" );
	ok( c.w == -w, "Passed!" );

	c.copy( a ).max( b );
	ok( c.x == x, "Passed!" );
	ok( c.y == y, "Passed!" );
	ok( c.z == z, "Passed!" );
	ok( c.w == w, "Passed!" );

	c.set( -2*x, 2*y, -2*z, 2*w );
	c.clamp( b, a );
	ok( c.x == -x, "Passed!" );
	ok( c.y == y, "Passed!" );
	ok( c.z == -z, "Passed!" );
	ok( c.w == w, "Passed!" );
});

test( "negate", function() {
	var a = new THREE.Vector4( x, y, z, w );

	a.negate();
	ok( a.x == -x, "Passed!" );
	ok( a.y == -y, "Passed!" );
	ok( a.z == -z, "Passed!" );
	ok( a.w == -w, "Passed!" );
});

test( "dot", function() {
	var a = new THREE.Vector4( x, y, z, w );
	var b = new THREE.Vector4( -x, -y, -z, -w );
	var c = new THREE.Vector4( 0, 0, 0, 0 );

	var result = a.dot( b );
	ok( result == (-x*x-y*y-z*z-w*w), "Passed!" );

	result = a.dot( c );
	ok( result == 0, "Passed!" );
});

test( "length/lengthSq", function() {
	var a = new THREE.Vector4( x, 0, 0, 0 );
	var b = new THREE.Vector4( 0, -y, 0, 0 );
	var c = new THREE.Vector4( 0, 0, z, 0 );
	var d = new THREE.Vector4( 0, 0, 0, w );
	var e = new THREE.Vector4( 0, 0, 0, 0 );
	
	ok( a.length() == x, "Passed!" );
	ok( a.lengthSq() == x*x, "Passed!" );
	ok( b.length() == y, "Passed!" );
	ok( b.lengthSq() == y*y, "Passed!" );
	ok( c.length() == z, "Passed!" );
	ok( c.lengthSq() == z*z, "Passed!" );
	ok( d.length() == w, "Passed!" );
	ok( d.lengthSq() == w*w, "Passed!" );
	ok( e.length() == 0, "Passed!" );
	ok( e.lengthSq() == 0, "Passed!" );

	a.set( x, y, z, w );
	ok( a.length() == Math.sqrt( x*x + y*y + z*z + w*w ), "Passed!" );
	ok( a.lengthSq() == ( x*x + y*y + z*z + w*w ), "Passed!" );
});

test( "normalize", function() {
	var a = new THREE.Vector4( x, 0, 0, 0 );
	var b = new THREE.Vector4( 0, -y, 0, 0 );
	var c = new THREE.Vector4( 0, 0, z, 0 );
	var d = new THREE.Vector4( 0, 0, 0, -w );
	
	a.normalize();
	ok( a.length() == 1, "Passed!" );
	ok( a.x == 1, "Passed!" );

	b.normalize();
	ok( b.length() == 1, "Passed!" );
	ok( b.y == -1, "Passed!" );

	c.normalize();
	ok( c.length() == 1, "Passed!" );
	ok( c.z == 1, "Passed!" );

	d.normalize();
	ok( d.length() == 1, "Passed!" );
	ok( d.w == -1, "Passed!" );
});

/*
test( "distanceTo/distanceToSquared", function() {
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


test( "setLength", function() {
	var a = new THREE.Vector4( x, 0, 0, 0 );

	ok( a.length() == x, "Passed!" );
	a.setLength( y );
	ok( a.length() == y, "Passed!" );

	a = new THREE.Vector4( 0, 0, 0, 0 );
	ok( a.length() == 0, "Passed!" );
	a.setLength( y );
	ok( a.length() == 0, "Passed!" );
});

test( "lerp/clone", function() {
	var a = new THREE.Vector4( x, 0, z, 0 );
	var b = new THREE.Vector4( 0, -y, 0, -w );

	ok( a.lerp( a, 0 ).equals( a.lerp( a, 0.5 ) ), "Passed!" );
	ok( a.lerp( a, 0 ).equals( a.lerp( a, 1 ) ), "Passed!" );

	ok( a.clone().lerp( b, 0 ).equals( a ), "Passed!" );

	ok( a.clone().lerp( b, 0.5 ).x == x*0.5, "Passed!" );
	ok( a.clone().lerp( b, 0.5 ).y == -y*0.5, "Passed!" );
	ok( a.clone().lerp( b, 0.5 ).z == z*0.5, "Passed!" );
	ok( a.clone().lerp( b, 0.5 ).w == -w*0.5, "Passed!" );

	ok( a.clone().lerp( b, 1 ).equals( b ), "Passed!" );
});

test( "equals", function() {
	var a = new THREE.Vector4( x, 0, z, 0 );
	var b = new THREE.Vector4( 0, -y, 0, -w );

	ok( a.x != b.x, "Passed!" );
	ok( a.y != b.y, "Passed!" );
	ok( a.z != b.z, "Passed!" );
	ok( a.w != b.w, "Passed!" );

	ok( ! a.equals( b ), "Passed!" );
	ok( ! b.equals( a ), "Passed!" );

	a.copy( b );
	ok( a.x == b.x, "Passed!" );
	ok( a.y == b.y, "Passed!" );
	ok( a.z == b.z, "Passed!" );
	ok( a.w == b.w, "Passed!" );

	ok( a.equals( b ), "Passed!" );
	ok( b.equals( a ), "Passed!" );
});
