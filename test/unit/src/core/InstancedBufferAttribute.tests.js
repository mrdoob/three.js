/* global QUnit */

import { InstancedBufferAttribute } from '../../../../src/core/InstancedBufferAttribute.js';

import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InstancedBufferAttribute', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			// array, itemSize
			let instance = new InstancedBufferAttribute( new Float32Array( 10 ), 2 );
			assert.ok( instance.meshPerAttribute === 1, 'Can instantiate an InstancedBufferGeometry.' );

			// array, itemSize, normalized, meshPerAttribute
			instance = new InstancedBufferAttribute( new Float32Array( 10 ), 2, false, 123 );
			assert.ok(
				instance.meshPerAttribute === 123,
				'Can instantiate an InstancedBufferGeometry with array, itemSize, normalized, and meshPerAttribute.'
			);

		} );

		// PROPERTIES
		QUnit.todo( 'meshPerAttribute', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isInstancedBufferAttribute', ( assert ) => {

			const object = new InstancedBufferAttribute();
			assert.ok(
				object.isInstancedBufferAttribute,
				'InstancedBufferAttribute.isInstancedBufferAttribute should be true'
			);

		} );

		QUnit.test( 'copy', ( assert ) => {

			const array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			const instance = new InstancedBufferAttribute( array, 2, true, 123 );
			const copiedInstance = instance.copy( instance );

			assert.ok( copiedInstance instanceof InstancedBufferAttribute, 'the clone has the correct type' );
			assert.ok( copiedInstance.itemSize === 2, 'itemSize was copied' );
			assert.ok( copiedInstance.normalized === true, 'normalized was copied' );
			assert.ok( copiedInstance.meshPerAttribute === 123, 'meshPerAttribute was copied' );

			for ( let i = 0; i < array.length; i ++ ) {

				assert.ok( copiedInstance.array[ i ] === array[ i ], 'array was copied' );

			}

		} );

		QUnit.todo( 'toJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
