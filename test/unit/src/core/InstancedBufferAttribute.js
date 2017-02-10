/**
 * @author simonThiele / https://github.com/simonThiele
 */

QUnit.module( "InstancedBufferAttribute" );

QUnit.test( "can be created", function( assert ) {
	var instance = new THREE.InstancedBufferAttribute(new Float32Array(10), 2);
	assert.ok( instance.meshPerAttribute === 1, "ok" );

	instance = new THREE.InstancedBufferAttribute(new Float32Array(10), 2, 123);
	assert.ok( instance.meshPerAttribute === 123, "ok" );

});

QUnit.test( "copy" , function( assert ) {
	var array = new Float32Array( [1, 2, 3, 7, 8, 9] );
	var instance = new THREE.InstancedBufferAttribute( array, 2, 123 );
	var copiedInstance = instance.copy( instance );

	assert.ok( copiedInstance instanceof THREE.InstancedBufferAttribute, "the clone has the correct type" );
	assert.ok( copiedInstance.itemSize === 2, "itemSize was copied" );
	assert.ok( copiedInstance.meshPerAttribute === 123, "meshPerAttribute was copied" );

	for (var i = 0; i < array.length; i++) {
		assert.ok( copiedInstance.array[i] === array[i], "array was copied" );
	}

});
