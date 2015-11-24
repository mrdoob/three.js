/**
 * @author simonThiele / https://github.com/simonThiele
 */

module( "InstancedInterleavedBuffer" );

test( "can be created", function() {
	var array = new Float32Array( [1, 2, 3, 7, 8, 9] );
	var instance = new THREE.InstancedInterleavedBuffer( array, 3 );

	ok( instance.meshPerAttribute === 1, "ok" );
});

test( "copy", function() {
	var array = new Float32Array( [1, 2, 3, 7, 8, 9] );
	var instance = new THREE.InstancedInterleavedBuffer( array, 3 );
	var copiedInstance = instance.copy( instance );

	ok( copiedInstance.meshPerAttribute === 1, "additional attribute was copied" );
});
