/* global QUnit */

import { InstancedBufferGeometry } from '../../../../src/core/InstancedBufferGeometry';
import { BufferAttribute } from '../../../../src/core/BufferAttribute';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InstancedBufferGeometry', () => {

		function createClonableMock() {

			return {
				callCount: 0,
				clone: function () {

					this.callCount ++;
					return this;

				}
			};

		}

		// INHERITANCE
		QUnit.todo( 'Extending', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'copy', ( assert ) => {

			var instanceMock1 = {};
			var instanceMock2 = {};
			var indexMock = createClonableMock();
			var defaultAttribute1 = new BufferAttribute( new Float32Array( [ 1 ] ) );
			var defaultAttribute2 = new BufferAttribute( new Float32Array( [ 2 ] ) );

			var instance = new InstancedBufferGeometry();

			instance.addGroup( 0, 10, instanceMock1 );
			instance.addGroup( 10, 5, instanceMock2 );
			instance.setIndex( indexMock );
			instance.setAttribute( 'defaultAttribute1', defaultAttribute1 );
			instance.setAttribute( 'defaultAttribute2', defaultAttribute2 );

			var copiedInstance = new InstancedBufferGeometry().copy( instance );

			assert.ok( copiedInstance instanceof InstancedBufferGeometry, 'the clone has the correct type' );

			assert.equal( copiedInstance.index, indexMock, 'index was copied' );
			assert.equal( copiedInstance.index.callCount, 1, 'index.clone was called once' );

			assert.ok( copiedInstance.attributes[ 'defaultAttribute1' ] instanceof BufferAttribute, 'attribute was created' );
			assert.deepEqual( copiedInstance.attributes[ 'defaultAttribute1' ].array, defaultAttribute1.array, 'attribute was copied' );
			assert.deepEqual( copiedInstance.attributes[ 'defaultAttribute2' ].array, defaultAttribute2.array, 'attribute was copied' );

			assert.equal( copiedInstance.groups[ 0 ].start, 0, 'group was copied' );
			assert.equal( copiedInstance.groups[ 0 ].count, 10, 'group was copied' );
			assert.equal( copiedInstance.groups[ 0 ].materialIndex, instanceMock1, 'group was copied' );

			assert.equal( copiedInstance.groups[ 1 ].start, 10, 'group was copied' );
			assert.equal( copiedInstance.groups[ 1 ].count, 5, 'group was copied' );
			assert.equal( copiedInstance.groups[ 1 ].materialIndex, instanceMock2, 'group was copied' );

		} );

		QUnit.todo( 'clone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
