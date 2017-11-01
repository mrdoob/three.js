/**
 * @author moraxy / https://github.com/moraxy
 */

QUnit.module( "Uniform" );

QUnit.test( "constructor", function ( assert ) {

	var a;
	var b = new THREE.Vector3( x, y, z );

	a = new THREE.Uniform( 5 );
	assert.strictEqual( a.value, 5, "New constructor works with simple values" );

	a = new THREE.Uniform( b );
	assert.ok( a.value.equals( b ), "New constructor works with complex values" );

} );

QUnit.test( "clone", function ( assert ) {

	var a = new THREE.Uniform( 23 );
	var b = a.clone();

	assert.strictEqual( b.value, a.value, "clone() with simple values works" );

	a = new THREE.Uniform( new THREE.Vector3( 1, 2, 3 ) );
	b = a.clone();

	assert.ok( b.value.equals( a.value ), "clone() with complex values works" );

} );
