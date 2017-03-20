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
