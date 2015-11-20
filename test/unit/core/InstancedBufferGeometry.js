/**
 * @author simonThiele / https://github.com/simonThiele
 */

module( "InstancedBufferGeometry" );

function createClonableMock() {
	return {
		callCount: 0,
		clone: function() {
			this.callCount++;
			return this;
		}
	}
}

test( "copy", function() {
	var instanceMock1 = {};
	var instanceMock2 = {};
	var indexMock = createClonableMock();
	var attributeMock1 = {};
	var attributeMock2 = {};

	var instance = new THREE.InstancedBufferGeometry();

	instance.addGroup(0, 10, instanceMock1);
	instance.addGroup(10, 5, instanceMock2);
	instance.setIndex(indexMock);
	instance.addAttribute('attributeMock1', attributeMock1);
	instance.addAttribute('attributeMock2', attributeMock2);

	var copiedInstance = instance.copy(instance);

	ok( copiedInstance instanceof THREE.InstancedBufferGeometry, "the clone has the correct type" );

	ok( copiedInstance.index === indexMock, "index was copied" );
	ok( copiedInstance.index.callCount === 1, "index.clone was called once" );

	ok( copiedInstance.attributes['attributeMock1'] instanceof THREE.BufferAttribute, "attribute was created" );
	// the given attribute mock was passed to the array property of the created buffer attribute
	ok( copiedInstance.attributes['attributeMock1'].array === attributeMock1, "attribute was copied" );
	ok( copiedInstance.attributes['attributeMock2'].array === attributeMock2, "attribute was copied" );

	ok( copiedInstance.groups[0].start === 0, "group was copied" );
	ok( copiedInstance.groups[0].count === 10, "group was copied" );
	ok( copiedInstance.groups[0].instances === instanceMock1, "group was copied" );

	ok( copiedInstance.groups[1].start === 10, "group was copied" );
	ok( copiedInstance.groups[1].count === 5, "group was copied" );
	ok( copiedInstance.groups[1].instances === instanceMock2, "group was copied" );
});
