/* global QUnit */

import { InstancedBufferGeometry } from '../../../../src/core/InstancedBufferGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';

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
		QUnit.test( 'Extending', ( assert ) => {

			const object = new InstancedBufferGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'InstancedBufferGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new InstancedBufferGeometry();
			assert.ok( object, 'Can instantiate an InstancedBufferGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new InstancedBufferGeometry();
			assert.ok(
				object.type === 'InstancedBufferGeometry',
				'InstancedBufferGeometry.type should be InstancedBufferGeometry'
			);

		} );

		QUnit.todo( 'instanceCount', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isInstancedBufferGeometry', ( assert ) => {

			const object = new InstancedBufferGeometry();
			assert.ok(
				object.isInstancedBufferGeometry,
				'InstancedBufferGeometry.isInstancedBufferGeometry should be true'
			);

		} );

		QUnit.test( 'copy', ( assert ) => {

			const instanceMock1 = {};
			const instanceMock2 = {};
			const indexMock = createClonableMock();
			const defaultAttribute1 = new BufferAttribute( new Float32Array( [ 1 ] ) );
			const defaultAttribute2 = new BufferAttribute( new Float32Array( [ 2 ] ) );

			const instance = new InstancedBufferGeometry();

			instance.addGroup( 0, 10, instanceMock1 );
			instance.addGroup( 10, 5, instanceMock2 );
			instance.setIndex( indexMock );
			instance.setAttribute( 'defaultAttribute1', defaultAttribute1 );
			instance.setAttribute( 'defaultAttribute2', defaultAttribute2 );

			const copiedInstance = new InstancedBufferGeometry().copy( instance );

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

		QUnit.todo( 'toJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
