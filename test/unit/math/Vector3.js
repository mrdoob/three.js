/**
 * @author bhouston / http://exocortex.com
 */

module( "Vector3" );

test( "constructor", function() {
	var a = new THREE.Vector3();
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );
	ok( a.z == 0, "Passed!" );

	a = new THREE.Vector3( x, y, z );
	ok( a.x === x, "Passed!" );
	ok( a.y === y, "Passed!" );
	ok( a.z === z, "Passed!" );
});

test( "copy", function() {
	var a = new THREE.Vector3( x, y, z );
	var b = new THREE.Vector3().copy( a );
	ok( b.x == x, "Passed!" );
	ok( b.y == y, "Passed!" );
	ok( b.z == z, "Passed!" );

	// ensure that it is a true copy
	a.x = 0;
	a.y = -1;
	a.z = -2;
	ok( b.x == x, "Passed!" );
	ok( b.y == y, "Passed!" );
	ok( b.z == z, "Passed!" );
});

test( "set", function() {
	var a = new THREE.Vector3();
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );
	ok( a.z == 0, "Passed!" );

	a.set( x, y, z );
	ok( a.x == x, "Passed!" );
	ok( a.y == y, "Passed!" );
	ok( a.z == z, "Passed!" );
});

test( "setX,setY,setZ", function() {
	var a = new THREE.Vector3();
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );
	ok( a.z == 0, "Passed!" );

	a.setX( x );
	a.setY( y );
	a.setZ( z );

	ok( a.x == x, "Passed!" );
	ok( a.y == y, "Passed!" );
	ok( a.z == z, "Passed!" );
});

test( "setComponent,getComponent", function() {
	var a = new THREE.Vector3();
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );
	ok( a.z == 0, "Passed!" );

	a.setComponent( 0, 1 );
	a.setComponent( 1, 2 );
	a.setComponent( 2, 3 );
	ok( a.getComponent( 0 ) == 1, "Passed!" );
	ok( a.getComponent( 1 ) == 2, "Passed!" );
	ok( a.getComponent( 2 ) == 3, "Passed!" );
});

test( "add", function() {
	var a = new THREE.Vector3( x, y, z );
	var b = new THREE.Vector3( -x, -y, -z );

	a.add( b );
	ok( a.x == 0, "Passed!" );
	ok( a.y == 0, "Passed!" );
	ok( a.z == 0, "Passed!" );

	var c = new THREE.Vector3().addVectors( b, b );
	ok( c.x == -2*x, "Passed!" );
	ok( c.y == -2*y, "Passed!" );
	ok( c.z == -2*z, "Passed!" );
});

test( "sub", function() {
	var a = new THREE.Vector3( x, y, z );
	var b = new THREE.Vector3( -x, -y, -z );

	a.sub( b );
	ok( a.x == 2*x, "Passed!" );
	ok( a.y == 2*y, "Passed!" );
	ok( a.z == 2*z, "Passed!" );

	var c = new THREE.Vector3().subVectors( a, a );
	ok( c.x == 0, "Passed!" );
	ok( c.y == 0, "Passed!" );
	ok( c.z == 0, "Passed!" );
});

test( "multiply/divide", function() {
	var a = new THREE.Vector3( x, y, z );
	var b = new THREE.Vector3( -x, -y, -z );

	a.multiplyScalar( -2 );
	ok( a.x == x*-2, "Passed!" );
	ok( a.y == y*-2, "Passed!" );
	ok( a.z == z*-2, "Passed!" );

	b.multiplyScalar( -2 );
	ok( b.x == 2*x, "Passed!" );
	ok( b.y == 2*y, "Passed!" );
	ok( b.z == 2*z, "Passed!" );

	a.divideScalar( -2 );
	ok( a.x == x, "Passed!" );
	ok( a.y == y, "Passed!" );
	ok( a.z == z, "Passed!" );

	b.divideScalar( -2 );
	ok( b.x == -x, "Passed!" );
	ok( b.y == -y, "Passed!" );
	ok( b.z == -z, "Passed!" );
});

test( "min/max/clamp", function() {
	var a = new THREE.Vector3( x, y, z );
	var b = new THREE.Vector3( -x, -y, -z );
	var c = new THREE.Vector3();

	c.copy( a ).min( b );
	ok( c.x == -x, "Passed!" );
	ok( c.y == -y, "Passed!" );
	ok( c.z == -z, "Passed!" );

	c.copy( a ).max( b );
	ok( c.x == x, "Passed!" );
	ok( c.y == y, "Passed!" );
	ok( c.z == z, "Passed!" );

	c.set( -2*x, 2*y, -2*z );
	c.clamp( b, a );
	ok( c.x == -x, "Passed!" );
	ok( c.y == y, "Passed!" );
	ok( c.z == -z, "Passed!" );
});

test( "negate", function() {
	var a = new THREE.Vector3( x, y, z );

	a.negate();
	ok( a.x == -x, "Passed!" );
	ok( a.y == -y, "Passed!" );
	ok( a.z == -z, "Passed!" );
});

test( "dot", function() {
	var a = new THREE.Vector3( x, y, z );
	var b = new THREE.Vector3( -x, -y, -z );
	var c = new THREE.Vector3();

	var result = a.dot( b );
	ok( result == (-x*x-y*y-z*z), "Passed!" );

	result = a.dot( c );
	ok( result == 0, "Passed!" );
});

test( "length/lengthSq", function() {
	var a = new THREE.Vector3( x, 0, 0 );
	var b = new THREE.Vector3( 0, -y, 0 );
	var c = new THREE.Vector3( 0, 0, z );
	var d = new THREE.Vector3();

	ok( a.length() == x, "Passed!" );
	ok( a.lengthSq() == x*x, "Passed!" );
	ok( b.length() == y, "Passed!" );
	ok( b.lengthSq() == y*y, "Passed!" );
	ok( c.length() == z, "Passed!" );
	ok( c.lengthSq() == z*z, "Passed!" );
	ok( d.length() == 0, "Passed!" );
	ok( d.lengthSq() == 0, "Passed!" );

	a.set( x, y, z );
	ok( a.length() == Math.sqrt( x*x + y*y + z*z ), "Passed!" );
	ok( a.lengthSq() == ( x*x + y*y + z*z ), "Passed!" );
});

test( "normalize", function() {
	var a = new THREE.Vector3( x, 0, 0 );
	var b = new THREE.Vector3( 0, -y, 0 );
	var c = new THREE.Vector3( 0, 0, z );

	a.normalize();
	ok( a.length() == 1, "Passed!" );
	ok( a.x == 1, "Passed!" );

	b.normalize();
	ok( b.length() == 1, "Passed!" );
	ok( b.y == -1, "Passed!" );

	c.normalize();
	ok( c.length() == 1, "Passed!" );
	ok( c.z == 1, "Passed!" );
});

test( "distanceTo/distanceToSquared", function() {
	var a = new THREE.Vector3( x, 0, 0 );
	var b = new THREE.Vector3( 0, -y, 0 );
	var c = new THREE.Vector3( 0, 0, z );
	var d = new THREE.Vector3();

	ok( a.distanceTo( d ) == x, "Passed!" );
	ok( a.distanceToSquared( d ) == x*x, "Passed!" );

	ok( b.distanceTo( d ) == y, "Passed!" );
	ok( b.distanceToSquared( d ) == y*y, "Passed!" );

	ok( c.distanceTo( d ) == z, "Passed!" );
	ok( c.distanceToSquared( d ) == z*z, "Passed!" );
});

test( "setLength", function() {
	var a = new THREE.Vector3( x, 0, 0 );

	ok( a.length() == x, "Passed!" );
	a.setLength( y );
	ok( a.length() == y, "Passed!" );

	a = new THREE.Vector3( 0, 0, 0 );
	ok( a.length() == 0, "Passed!" );
	a.setLength( y );
	ok( a.length() == 0, "Passed!" );

});

test( "projectOnVector", function() {
	var a = new THREE.Vector3( 1, 0, 0 );
	var b = new THREE.Vector3();
	var normal = new THREE.Vector3( 10, 0, 0 );

	ok( b.copy( a ).projectOnVector( normal ).equals( new THREE.Vector3( 1, 0, 0 ) ), "Passed!" );

	a.set( 0, 1, 0 );
	ok( b.copy( a ).projectOnVector( normal ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );

	a.set( 0, 0, -1 );
	ok( b.copy( a ).projectOnVector( normal ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );

	a.set( -1, 0, 0 );
	ok( b.copy( a ).projectOnVector( normal ).equals( new THREE.Vector3( -1, 0, 0 ) ), "Passed!" );

});

test( "projectOnPlane", function() {
	var a = new THREE.Vector3( 1, 0, 0 );
	var b = new THREE.Vector3();
	var normal = new THREE.Vector3( 1, 0, 0 );

	ok( b.copy( a ).projectOnPlane( normal ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );

	a.set( 0, 1, 0 );
	ok( b.copy( a ).projectOnPlane( normal ).equals( new THREE.Vector3( 0, 1, 0 ) ), "Passed!" );

	a.set( 0, 0, -1 );
	ok( b.copy( a ).projectOnPlane( normal ).equals( new THREE.Vector3( 0, 0, -1 ) ), "Passed!" );

	a.set( -1, 0, 0 );
	ok( b.copy( a ).projectOnPlane( normal ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );

});

test( "reflect", function() {
	var a = new THREE.Vector3( 1, 0, 0 );
	var normal = new THREE.Vector3( 1, 0, 0 );
	var b = new THREE.Vector3( 0, 0, 0 );

	ok( b.copy( a ).reflect( normal ).equals( new THREE.Vector3( 1, 0, 0 ) ), "Passed!" );

	a.set( 1, -1, 0 );
	ok( b.copy( a ).reflect( normal ).equals( new THREE.Vector3( 1, 1, 0 ) ), "Passed!" );

	a.set( 1, -1, 0 );
	normal.set( 0, -1, 0 );
	ok( b.copy( a ).reflect(  normal ).equals( new THREE.Vector3( -1, -1, 0 ) ), "Passed!" );
});

test( "angleTo", function() {
	var a = new THREE.Vector3( 0, -0.18851655680720186, 0.9820700116639124 );
	var b = new THREE.Vector3( 0, 0.18851655680720186, -0.9820700116639124 );

	equal( a.angleTo( a ), 0 );
	equal( a.angleTo( b ), Math.PI );

	var x = new THREE.Vector3( 1, 0, 0 );
	var y = new THREE.Vector3( 0, 1, 0 );
	var z = new THREE.Vector3( 0, 0, 1 );

	equal( x.angleTo( y ), Math.PI / 2 );
	equal( x.angleTo( z ), Math.PI / 2 );
	equal( z.angleTo( x ), Math.PI / 2 );

	ok( Math.abs( x.angleTo( new THREE.Vector3( 1, 1, 0 ) ) - ( Math.PI / 4 ) ) < 0.0000001 );
});

test( "lerp/clone", function() {
	var a = new THREE.Vector3( x, 0, z );
	var b = new THREE.Vector3( 0, -y, 0 );

	ok( a.lerp( a, 0 ).equals( a.lerp( a, 0.5 ) ), "Passed!" );
	ok( a.lerp( a, 0 ).equals( a.lerp( a, 1 ) ), "Passed!" );

	ok( a.clone().lerp( b, 0 ).equals( a ), "Passed!" );

	ok( a.clone().lerp( b, 0.5 ).x == x*0.5, "Passed!" );
	ok( a.clone().lerp( b, 0.5 ).y == -y*0.5, "Passed!" );
	ok( a.clone().lerp( b, 0.5 ).z == z*0.5, "Passed!" );

	ok( a.clone().lerp( b, 1 ).equals( b ), "Passed!" );
});

test( "equals", function() {
	var a = new THREE.Vector3( x, 0, z );
	var b = new THREE.Vector3( 0, -y, 0 );

	ok( a.x != b.x, "Passed!" );
	ok( a.y != b.y, "Passed!" );
	ok( a.z != b.z, "Passed!" );

	ok( ! a.equals( b ), "Passed!" );
	ok( ! b.equals( a ), "Passed!" );

	a.copy( b );
	ok( a.x == b.x, "Passed!" );
	ok( a.y == b.y, "Passed!" );
	ok( a.z == b.z, "Passed!" );

	ok( a.equals( b ), "Passed!" );
	ok( b.equals( a ), "Passed!" );
});
