/**
 * @author simonThiele / https://github.com/simonThiele
 */

module( "InstancedBufferAttribute" );

test( "can be created", function() {
	var instance = new THREE.InstancedBufferAttribute(new Float32Array(10), 2);
	ok( instance.meshPerAttribute === 1, "ok" );

	instance = new THREE.InstancedBufferAttribute(new Float32Array(10), 2, 123);
	ok( instance.meshPerAttribute === 123, "ok" );

});

test( "copy", function() {
	var array = new Float32Array( [1, 2, 3, 7, 8, 9] );
	var instance = new THREE.InstancedBufferAttribute( array, 2, 123 );
	var copiedInstance = instance.copy( instance );

	ok( copiedInstance instanceof THREE.InstancedBufferAttribute, "the clone has the correct type" );
	ok( copiedInstance.itemSize === 2, "itemSize was copied" );
	ok( copiedInstance.meshPerAttribute === 123, "meshPerAttribute was copied" );

	for (var i = 0; i < array.length; i++) {
		ok( copiedInstance.array[i] === array[i], "array was copied" );
	}

});
