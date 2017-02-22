/**
 * @author bhouston / http://exocortex.com
 */

QUnit.module( "Vector3" );

QUnit.test( "constructor" , function( assert ) {
	var a = new THREE.Vector3();
	assert.ok( a.x == 0, "Passed!" );
	assert.ok( a.y == 0, "Passed!" );
	assert.ok( a.z == 0, "Passed!" );

	a = new THREE.Vector3( x, y, z );
	assert.ok( a.x === x, "Passed!" );
	assert.ok( a.y === y, "Passed!" );
	assert.ok( a.z === z, "Passed!" );
});

QUnit.test( "copy" , function( assert ) {
	var a = new THREE.Vector3( x, y, z );
	var b = new THREE.Vector3().copy( a );
	assert.ok( b.x == x, "Passed!" );
	assert.ok( b.y == y, "Passed!" );
	assert.ok( b.z == z, "Passed!" );

	// ensure that it is a true copy
	a.x = 0;
	a.y = -1;
	a.z = -2;
	assert.ok( b.x == x, "Passed!" );
	assert.ok( b.y == y, "Passed!" );
	assert.ok( b.z == z, "Passed!" );
});

QUnit.test( "set" , function( assert ) {
	var a = new THREE.Vector3();
	assert.ok( a.x == 0, "Passed!" );
	assert.ok( a.y == 0, "Passed!" );
	assert.ok( a.z == 0, "Passed!" );

	a.set( x, y, z );
	assert.ok( a.x == x, "Passed!" );
	assert.ok( a.y == y, "Passed!" );
	assert.ok( a.z == z, "Passed!" );
});

QUnit.test( "setX,setY,setZ", function( assert ) {
	var a = new THREE.Vector3();
	assert.ok( a.x == 0, "Passed!" );
	assert.ok( a.y == 0, "Passed!" );
	assert.ok( a.z == 0, "Passed!" );

	a.setX( x );
	a.setY( y );
	a.setZ( z );

	assert.ok( a.x == x, "Passed!" );
	assert.ok( a.y == y, "Passed!" );
	assert.ok( a.z == z, "Passed!" );
});

QUnit.test( "setComponent,getComponent", function( assert ) {
	var a = new THREE.Vector3();
	assert.ok( a.x == 0, "Passed!" );
	assert.ok( a.y == 0, "Passed!" );
	assert.ok( a.z == 0, "Passed!" );

	a.setComponent( 0, 1 );
	a.setComponent( 1, 2 );
	a.setComponent( 2, 3 );
	assert.ok( a.getComponent( 0 ) == 1, "Passed!" );
	assert.ok( a.getComponent( 1 ) == 2, "Passed!" );
	assert.ok( a.getComponent( 2 ) == 3, "Passed!" );
});

QUnit.test( "add" , function( assert ) {
	var a = new THREE.Vector3( x, y, z );
	var b = new THREE.Vector3( -x, -y, -z );

	a.add( b );
	assert.ok( a.x == 0, "Passed!" );
	assert.ok( a.y == 0, "Passed!" );
	assert.ok( a.z == 0, "Passed!" );

	var c = new THREE.Vector3().addVectors( b, b );
	assert.ok( c.x == -2*x, "Passed!" );
	assert.ok( c.y == -2*y, "Passed!" );
	assert.ok( c.z == -2*z, "Passed!" );
});

QUnit.test( "sub" , function( assert ) {
	var a = new THREE.Vector3( x, y, z );
	var b = new THREE.Vector3( -x, -y, -z );

	a.sub( b );
	assert.ok( a.x == 2*x, "Passed!" );
	assert.ok( a.y == 2*y, "Passed!" );
	assert.ok( a.z == 2*z, "Passed!" );

	var c = new THREE.Vector3().subVectors( a, a );
	assert.ok( c.x == 0, "Passed!" );
	assert.ok( c.y == 0, "Passed!" );
	assert.ok( c.z == 0, "Passed!" );
});

QUnit.test( "multiply/divide", function( assert ) {
	var a = new THREE.Vector3( x, y, z );
	var b = new THREE.Vector3( -x, -y, -z );

	a.multiplyScalar( -2 );
	assert.ok( a.x == x*-2, "Passed!" );
	assert.ok( a.y == y*-2, "Passed!" );
	assert.ok( a.z == z*-2, "Passed!" );

	b.multiplyScalar( -2 );
	assert.ok( b.x == 2*x, "Passed!" );
	assert.ok( b.y == 2*y, "Passed!" );
	assert.ok( b.z == 2*z, "Passed!" );

	a.divideScalar( -2 );
	assert.ok( a.x == x, "Passed!" );
	assert.ok( a.y == y, "Passed!" );
	assert.ok( a.z == z, "Passed!" );

	b.divideScalar( -2 );
	assert.ok( b.x == -x, "Passed!" );
	assert.ok( b.y == -y, "Passed!" );
	assert.ok( b.z == -z, "Passed!" );
});

QUnit.test( "min/max/clamp", function( assert ) {
	var a = new THREE.Vector3( x, y, z );
	var b = new THREE.Vector3( -x, -y, -z );
	var c = new THREE.Vector3();

	c.copy( a ).min( b );
	assert.ok( c.x == -x, "Passed!" );
	assert.ok( c.y == -y, "Passed!" );
	assert.ok( c.z == -z, "Passed!" );

	c.copy( a ).max( b );
	assert.ok( c.x == x, "Passed!" );
	assert.ok( c.y == y, "Passed!" );
	assert.ok( c.z == z, "Passed!" );

	c.set( -2*x, 2*y, -2*z );
	c.clamp( b, a );
	assert.ok( c.x == -x, "Passed!" );
	assert.ok( c.y == y, "Passed!" );
	assert.ok( c.z == -z, "Passed!" );
});

QUnit.test( "negate" , function( assert ) {
	var a = new THREE.Vector3( x, y, z );

	a.negate();
	assert.ok( a.x == -x, "Passed!" );
	assert.ok( a.y == -y, "Passed!" );
	assert.ok( a.z == -z, "Passed!" );
});

QUnit.test( "dot" , function( assert ) {
	var a = new THREE.Vector3( x, y, z );
	var b = new THREE.Vector3( -x, -y, -z );
	var c = new THREE.Vector3();

	var result = a.dot( b );
	assert.ok( result == (-x*x-y*y-z*z), "Passed!" );

	result = a.dot( c );
	assert.ok( result == 0, "Passed!" );
});

QUnit.test( "length/lengthSq", function( assert ) {
	var a = new THREE.Vector3( x, 0, 0 );
	var b = new THREE.Vector3( 0, -y, 0 );
	var c = new THREE.Vector3( 0, 0, z );
	var d = new THREE.Vector3();

	assert.ok( a.length() == x, "Passed!" );
	assert.ok( a.lengthSq() == x*x, "Passed!" );
	assert.ok( b.length() == y, "Passed!" );
	assert.ok( b.lengthSq() == y*y, "Passed!" );
	assert.ok( c.length() == z, "Passed!" );
	assert.ok( c.lengthSq() == z*z, "Passed!" );
	assert.ok( d.length() == 0, "Passed!" );
	assert.ok( d.lengthSq() == 0, "Passed!" );

	a.set( x, y, z );
	assert.ok( a.length() == Math.sqrt( x*x + y*y + z*z ), "Passed!" );
	assert.ok( a.lengthSq() == ( x*x + y*y + z*z ), "Passed!" );
});

QUnit.test( "normalize" , function( assert ) {
	var a = new THREE.Vector3( x, 0, 0 );
	var b = new THREE.Vector3( 0, -y, 0 );
	var c = new THREE.Vector3( 0, 0, z );

	a.normalize();
	assert.ok( a.length() == 1, "Passed!" );
	assert.ok( a.x == 1, "Passed!" );

	b.normalize();
	assert.ok( b.length() == 1, "Passed!" );
	assert.ok( b.y == -1, "Passed!" );

	c.normalize();
	assert.ok( c.length() == 1, "Passed!" );
	assert.ok( c.z == 1, "Passed!" );
});

QUnit.test( "distanceTo/distanceToSquared", function( assert ) {
	var a = new THREE.Vector3( x, 0, 0 );
	var b = new THREE.Vector3( 0, -y, 0 );
	var c = new THREE.Vector3( 0, 0, z );
	var d = new THREE.Vector3();

	assert.ok( a.distanceTo( d ) == x, "Passed!" );
	assert.ok( a.distanceToSquared( d ) == x*x, "Passed!" );

	assert.ok( b.distanceTo( d ) == y, "Passed!" );
	assert.ok( b.distanceToSquared( d ) == y*y, "Passed!" );

	assert.ok( c.distanceTo( d ) == z, "Passed!" );
	assert.ok( c.distanceToSquared( d ) == z*z, "Passed!" );
});

QUnit.test( "setLength" , function( assert ) {
	var a = new THREE.Vector3( x, 0, 0 );

	assert.ok( a.length() == x, "Passed!" );
	a.setLength( y );
	assert.ok( a.length() == y, "Passed!" );

	a = new THREE.Vector3( 0, 0, 0 );
	assert.ok( a.length() == 0, "Passed!" );
	a.setLength( y );
	assert.ok( isNaN( a.length() ), "Passed!" );

});

QUnit.test( "projectOnVector" , function( assert ) {
	var a = new THREE.Vector3( 1, 0, 0 );
	var b = new THREE.Vector3();
	var normal = new THREE.Vector3( 10, 0, 0 );

	assert.ok( b.copy( a ).projectOnVector( normal ).equals( new THREE.Vector3( 1, 0, 0 ) ), "Passed!" );

	a.set( 0, 1, 0 );
	assert.ok( b.copy( a ).projectOnVector( normal ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );

	a.set( 0, 0, -1 );
	assert.ok( b.copy( a ).projectOnVector( normal ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );

	a.set( -1, 0, 0 );
	assert.ok( b.copy( a ).projectOnVector( normal ).equals( new THREE.Vector3( -1, 0, 0 ) ), "Passed!" );

});

QUnit.test( "projectOnPlane" , function( assert ) {
	var a = new THREE.Vector3( 1, 0, 0 );
	var b = new THREE.Vector3();
	var normal = new THREE.Vector3( 1, 0, 0 );

	assert.ok( b.copy( a ).projectOnPlane( normal ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );

	a.set( 0, 1, 0 );
	assert.ok( b.copy( a ).projectOnPlane( normal ).equals( new THREE.Vector3( 0, 1, 0 ) ), "Passed!" );

	a.set( 0, 0, -1 );
	assert.ok( b.copy( a ).projectOnPlane( normal ).equals( new THREE.Vector3( 0, 0, -1 ) ), "Passed!" );

	a.set( -1, 0, 0 );
	assert.ok( b.copy( a ).projectOnPlane( normal ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );

});

QUnit.test( "reflect" , function( assert ) {
	var a = new THREE.Vector3();
	var normal = new THREE.Vector3( 0, 1, 0 );
	var b = new THREE.Vector3();

	a.set( 0, -1, 0 );
	assert.ok( b.copy( a ).reflect( normal ).equals( new THREE.Vector3( 0, 1, 0 ) ), "Passed!" );

	a.set( 1, -1, 0 );
	assert.ok( b.copy( a ).reflect( normal ).equals( new THREE.Vector3( 1, 1, 0 ) ), "Passed!" );

	a.set( 1, -1, 0 );
	normal.set( 0, -1, 0 );
	assert.ok( b.copy( a ).reflect( normal ).equals( new THREE.Vector3( 1, 1, 0 ) ), "Passed!" );
});

QUnit.test( "angleTo" , function( assert ) {
	var a = new THREE.Vector3( 0, -0.18851655680720186, 0.9820700116639124 );
	var b = new THREE.Vector3( 0, 0.18851655680720186, -0.9820700116639124 );

	assert.equal( a.angleTo( a ), 0 );
	assert.equal( a.angleTo( b ), Math.PI );

	var x = new THREE.Vector3( 1, 0, 0 );
	var y = new THREE.Vector3( 0, 1, 0 );
	var z = new THREE.Vector3( 0, 0, 1 );

	assert.equal( x.angleTo( y ), Math.PI / 2 );
	assert.equal( x.angleTo( z ), Math.PI / 2 );
	assert.equal( z.angleTo( x ), Math.PI / 2 );

	assert.ok( Math.abs( x.angleTo( new THREE.Vector3( 1, 1, 0 ) ) - ( Math.PI / 4 ) ) < 0.0000001 );
});

QUnit.test( "lerp/clone", function( assert ) {
	var a = new THREE.Vector3( x, 0, z );
	var b = new THREE.Vector3( 0, -y, 0 );

	assert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 0.5 ) ), "Passed!" );
	assert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 1 ) ), "Passed!" );

	assert.ok( a.clone().lerp( b, 0 ).equals( a ), "Passed!" );

	assert.ok( a.clone().lerp( b, 0.5 ).x == x*0.5, "Passed!" );
	assert.ok( a.clone().lerp( b, 0.5 ).y == -y*0.5, "Passed!" );
	assert.ok( a.clone().lerp( b, 0.5 ).z == z*0.5, "Passed!" );

	assert.ok( a.clone().lerp( b, 1 ).equals( b ), "Passed!" );
});

QUnit.test( "equals" , function( assert ) {
	var a = new THREE.Vector3( x, 0, z );
	var b = new THREE.Vector3( 0, -y, 0 );

	assert.ok( a.x != b.x, "Passed!" );
	assert.ok( a.y != b.y, "Passed!" );
	assert.ok( a.z != b.z, "Passed!" );

	assert.ok( ! a.equals( b ), "Passed!" );
	assert.ok( ! b.equals( a ), "Passed!" );

	a.copy( b );
	assert.ok( a.x == b.x, "Passed!" );
	assert.ok( a.y == b.y, "Passed!" );
	assert.ok( a.z == b.z, "Passed!" );

	assert.ok( a.equals( b ), "Passed!" );
	assert.ok( b.equals( a ), "Passed!" );
});

QUnit.test( "applyMatrix4" , function( assert ) {

	var a = new THREE.Vector3( x, y, z );
	var b = new THREE.Vector4( x, y, z, 1 );

	var m = new THREE.Matrix4().makeRotationX( Math.PI );
	a.applyMatrix4( m );
	b.applyMatrix4( m );
	assert.ok( a.x == b.x / b.w, "Passed!" );
	assert.ok( a.y == b.y / b.w, "Passed!" );
	assert.ok( a.z == b.z / b.w, "Passed!" );

	m = new THREE.Matrix4().makeTranslation( 3, 2, 1 );
	a.applyMatrix4( m );
	b.applyMatrix4( m );
	assert.ok( a.x == b.x / b.w, "Passed!" );
	assert.ok( a.y == b.y / b.w, "Passed!" );
	assert.ok( a.z == b.z / b.w, "Passed!" );

	m = new THREE.Matrix4().set(
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 1, 0
	);
	a.applyMatrix4( m );
	b.applyMatrix4( m );
	assert.ok( a.x == b.x / b.w, "Passed!" );
	assert.ok( a.y == b.y / b.w, "Passed!" );
	assert.ok( a.z == b.z / b.w, "Passed!" );

});
