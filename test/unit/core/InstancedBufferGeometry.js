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
	var defaultAttribute1 = new THREE.BufferAttribute([1]);
	var defaultAttribute2 = new THREE.BufferAttribute([2]);

	var instance = new THREE.InstancedBufferGeometry();

	instance.addGroup( 0, 10, instanceMock1 );
	instance.addGroup( 10, 5, instanceMock2 );
	instance.setIndex( indexMock );
	instance.addAttribute( 'defaultAttribute1', defaultAttribute1 );
	instance.addAttribute( 'defaultAttribute2', defaultAttribute2 );

	var copiedInstance = instance.copy( instance );

	ok( copiedInstance instanceof THREE.InstancedBufferGeometry, "the clone has the correct type" );

	ok( copiedInstance.index === indexMock, "index was copied" );
	ok( copiedInstance.index.callCount === 1, "index.clone was called once" );

	ok( copiedInstance.attributes['defaultAttribute1'] instanceof THREE.BufferAttribute, "attribute was created" );
	// the given attribute mock was passed to the array property of the created buffer attribute
	ok( copiedInstance.attributes['defaultAttribute1'].array[0] === defaultAttribute1.array, "attribute was copied" );
	ok( copiedInstance.attributes['defaultAttribute2'].array[0] === defaultAttribute2.array, "attribute was copied" );

	ok( copiedInstance.groups[0].start === 0, "group was copied" );
	ok( copiedInstance.groups[0].count === 10, "group was copied" );
	ok( copiedInstance.groups[0].instances === instanceMock1, "group was copied" );

	ok( copiedInstance.groups[1].start === 10, "group was copied" );
	ok( copiedInstance.groups[1].count === 5, "group was copied" );
	ok( copiedInstance.groups[1].instances === instanceMock2, "group was copied" );
});
