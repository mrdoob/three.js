/**
 * @author simonThiele / https://github.com/simonThiele
 */

QUnit.module( "InterleavedBufferAttribute" );

QUnit.test( "length and count", function( assert ) {
	var buffer = new THREE.InterleavedBuffer( new Float32Array( [1, 2, 3, 7, 8 ,9] ), 3 );
	var instance = new THREE.InterleavedBufferAttribute( buffer, 2, 0 );

	assert.ok( instance.count === 2, "count is calculated via array length / stride" );
});

QUnit.test( "setX" , function( assert ) {
	var buffer = new THREE.InterleavedBuffer( new Float32Array( [1, 2, 3, 7, 8 ,9] ), 3 );
	var instance = new THREE.InterleavedBufferAttribute( buffer, 2, 0 );

	instance.setX( 0, 123 );
	instance.setX( 1, 321 );

	assert.ok( instance.data.array[0] === 123 &&
			instance.data.array[3] === 321, "x was calculated correct based on index and default offset" );


	buffer = new THREE.InterleavedBuffer( new Float32Array( [1, 2, 3, 7, 8 ,9] ), 3 );
	instance = new THREE.InterleavedBufferAttribute( buffer, 2, 1 );

	instance.setX( 0, 123 );
	instance.setX( 1, 321 );

	// the offset was defined as 1, so go one step futher in the array
	assert.ok( instance.data.array[1] === 123 &&
			instance.data.array[4] === 321, "x was calculated correct based on index and default offset" );
});

// setY, setZ and setW are calculated in the same way so not testing this
