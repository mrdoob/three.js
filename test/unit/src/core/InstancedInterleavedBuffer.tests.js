/* global QUnit */

import { InstancedInterleavedBuffer } from '../../../../src/core/InstancedInterleavedBuffer.js';

import { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InstancedInterleavedBuffer', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new InstancedInterleavedBuffer();
			assert.strictEqual(
				object instanceof InterleavedBuffer, true,
				'InstancedInterleavedBuffer extends from InterleavedBuffer'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			const instance = new InstancedInterleavedBuffer( array, 3 );

			assert.ok( instance.meshPerAttribute === 1, 'ok' );

		} );

		// PROPERTIES
		QUnit.todo( 'meshPerAttribute', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isInstancedInterleavedBuffer', ( assert ) => {

			const object = new InstancedInterleavedBuffer();
			assert.ok(
				object.isInstancedInterleavedBuffer,
				'InstancedInterleavedBuffer.isInstancedInterleavedBuffer should be true'
			);

		} );

		QUnit.test( 'copy', ( assert ) => {

			const array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			const instance = new InstancedInterleavedBuffer( array, 3 );
			const copiedInstance = instance.copy( instance );

			assert.ok( copiedInstance.meshPerAttribute === 1, 'additional attribute was copied' );

		} );

		QUnit.todo( 'clone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
