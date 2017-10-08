/**
 * @author simonThiele / https://github.com/simonThiele
 */

QUnit.module( "InterleavedBuffer" );

function checkInstanceAgainstCopy( instance, copiedInstance, assert ) {
	assert.ok( copiedInstance instanceof THREE.InterleavedBuffer, "the clone has the correct type" );

	for ( var i = 0; i < instance.array.length; i++ ) {
		assert.ok( copiedInstance.array[i] === instance.array[i], "array was copied" );
	}

	assert.ok( copiedInstance.stride === instance.stride, "stride was copied" );
	assert.ok( copiedInstance.dynamic === true, "dynamic was copied" );
}

QUnit.test( "count", function( assert ) {
	var instance = new THREE.InterleavedBuffer( new Float32Array( [1, 2, 3, 7, 8 ,9] ), 3 );

	assert.equal( instance.count, 2, "count is calculated via array length / stride" );
});

QUnit.test( "copy" , function( assert ) {
	var array = new Float32Array( [1, 2, 3, 7, 8 ,9] );
	var instance = new THREE.InterleavedBuffer( array, 3 );
	instance.setDynamic( true );

	checkInstanceAgainstCopy(instance, instance.copy( instance ), assert );
});

QUnit.test( "clone" , function( assert ) {
	var array = new Float32Array( [1, 2, 3, 7, 8 ,9] );
	var instance = new THREE.InterleavedBuffer( array, 3 );
	instance.setDynamic( true );

	checkInstanceAgainstCopy( instance, instance.clone(), assert );
});

QUnit.test( "set" , function( assert ) {
	var instance = new THREE.InterleavedBuffer( new Float32Array( [1, 2, 3, 7, 8 ,9] ), 3 );

	instance.set( [0, -1] );
	assert.ok( instance.array[0] === 0 && instance.array[1] === -1, "replace at first by default" );
});

QUnit.test( "needsUpdate", function ( assert ) {

	var a = new THREE.InterleavedBuffer( new Float32Array( [ 1, 2, 3, 4 ], 2 ) );

	a.needsUpdate = true;

	assert.strictEqual( a.version, 1, "Check version increased" );

} );

QUnit.test( "setArray", function ( assert ) {

	var f32a = new Float32Array( [ 1, 2, 3, 4 ] );
	var f32b = new Float32Array( [ ] );
	var a = new THREE.InterleavedBuffer( f32a, 2, false );

	a.setArray( f32a );

	assert.strictEqual( a.count, 2, "Check item count for non-empty array" );
	assert.strictEqual( a.array, f32a, "Check array itself" );

	a.setArray( f32b );

	assert.strictEqual( a.count, 0, "Check item count for empty array" );
	assert.strictEqual( a.array, f32b, "Check array itself" );

	assert.throws(
		function () {

			a.setArray( [ 1, 2, 3, 4 ] );

		},
		/array should be a Typed Array/,
		"Calling setArray with a non-typed array throws Error"
	);

} );

QUnit.test( "copyAt", function ( assert ) {

	var a = new THREE.InterleavedBuffer( new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] ), 3 );
	var b = new THREE.InterleavedBuffer( new Float32Array( 9 ), 3 );
	var expected = new Float32Array( [ 4, 5, 6, 7, 8, 9, 1, 2, 3 ] );

	b.copyAt( 1, a, 2 );
	b.copyAt( 0, a, 1 );
	b.copyAt( 2, a, 0 );

	assert.deepEqual( b.array, expected, "Check the right values were replaced" );

} );

QUnit.test( "onUpload", function ( assert ) {

	var a = new THREE.InterleavedBuffer();
	var func = function () { };

	a.onUpload( func );

	assert.strictEqual( a.onUploadCallback, func, "Check callback was set properly" );

} );
