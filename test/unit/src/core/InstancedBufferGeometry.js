/**
 * @author simonThiele / https://github.com/simonThiele
 */

QUnit.module( "InstancedBufferGeometry" );

function createClonableMock() {
	return {
		callCount: 0,

		clone: function() {
			this.callCount++;

			return this;
		}
	}
}

QUnit.test( "copy" , function( assert ) {
	var instanceMock1 = {};
	var instanceMock2 = {};
	var indexMock = createClonableMock();
	var defaultAttribute1 = new THREE.BufferAttribute( new Float32Array( [ 1 ] ) );
	var defaultAttribute2 = new THREE.BufferAttribute( new Float32Array( [ 2 ] ) );

	var instance = new THREE.InstancedBufferGeometry();

	instance.addGroup( 0, 10, instanceMock1 );
	instance.addGroup( 10, 5, instanceMock2 );
	instance.setIndex( indexMock );
	instance.addAttribute( 'defaultAttribute1', defaultAttribute1 );
	instance.addAttribute( 'defaultAttribute2', defaultAttribute2 );

	var copiedInstance = instance.copy( instance );

	assert.ok( copiedInstance instanceof THREE.InstancedBufferGeometry, "the clone has the correct type" );

	assert.equal( copiedInstance.index, indexMock, "index was copied" );
	assert.equal( copiedInstance.index.callCount, 1, "index.clone was called once" );

	assert.ok( copiedInstance.attributes['defaultAttribute1'] instanceof THREE.BufferAttribute, "attribute was created" );
	assert.deepEqual( copiedInstance.attributes['defaultAttribute1'].array, defaultAttribute1.array, "attribute was copied" );
	assert.deepEqual( copiedInstance.attributes['defaultAttribute2'].array, defaultAttribute2.array, "attribute was copied" );

	assert.equal( copiedInstance.groups[0].start, 0, "group was copied" );
	assert.equal( copiedInstance.groups[0].count, 10, "group was copied" );
	assert.equal( copiedInstance.groups[0].materialIndex, instanceMock1, "group was copied" );

	assert.equal( copiedInstance.groups[1].start, 10, "group was copied" );
	assert.equal( copiedInstance.groups[1].count, 5, "group was copied" );
	assert.equal( copiedInstance.groups[1].materialIndex, instanceMock2, "group was copied" );
});
