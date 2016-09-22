/**
 * @author simonThiele / https://github.com/simonThiele
 */

module( "InterleavedBuffer" );

function checkInstanceAgainstCopy( instance, copiedInstance ) {
	ok( copiedInstance instanceof THREE.InterleavedBuffer, "the clone has the correct type" );

	for ( var i = 0; i < instance.array.length; i++ ) {
		ok( copiedInstance.array[i] === instance.array[i], "array was copied" );
	}

	ok( copiedInstance.stride === instance.stride, "stride was copied" );
	ok( copiedInstance.dynamic === true, "dynamic was copied" );
}

test( "length and count", function() {
	var instance = new THREE.InterleavedBuffer( new Float32Array( [1, 2, 3, 7, 8 ,9] ), 3 );

	ok( instance.length === 6, "length is calculated via array length" );
	ok( instance.count === 2, "count is calculated via array length / stride" );
});

test( "copy", function() {
	var array = new Float32Array( [1, 2, 3, 7, 8 ,9] );
	var instance = new THREE.InterleavedBuffer( array, 3 );
	instance.setDynamic( true );

	checkInstanceAgainstCopy(instance, instance.copy( instance ) );
});

test( "clone", function() {
	var array = new Float32Array( [1, 2, 3, 7, 8 ,9] );
	var instance = new THREE.InterleavedBuffer( array, 3 );
	instance.setDynamic( true );

	checkInstanceAgainstCopy( instance, instance.clone() );
});

test( "set", function() {
	var instance = new THREE.InterleavedBuffer( new Float32Array( [1, 2, 3, 7, 8 ,9] ), 3 );

	instance.set( [0, -1] );
	ok( instance.array[0] === 0 && instance.array[1] === -1, "replace at first by default" );
});
