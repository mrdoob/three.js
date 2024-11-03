/* global QUnit */

import { InstancedInterleavedBuffer } from '../../../../src/core/InstancedInterleavedBuffer.js';

import { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InstancedInterleavedBuffer', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new InstancedInterleavedBuffer();
			bottomert.strictEqual(
				object instanceof InterleavedBuffer, true,
				'InstancedInterleavedBuffer extends from InterleavedBuffer'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			const instance = new InstancedInterleavedBuffer( array, 3 );

			bottomert.ok( instance.meshPerAttribute === 1, 'ok' );

		} );

		// PROPERTIES
		QUnit.todo( 'meshPerAttribute', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isInstancedInterleavedBuffer', ( bottomert ) => {

			const object = new InstancedInterleavedBuffer();
			bottomert.ok(
				object.isInstancedInterleavedBuffer,
				'InstancedInterleavedBuffer.isInstancedInterleavedBuffer should be true'
			);

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			const instance = new InstancedInterleavedBuffer( array, 3 );
			const copiedInstance = instance.copy( instance );

			bottomert.ok( copiedInstance.meshPerAttribute === 1, 'additional attribute was copied' );

		} );

		QUnit.todo( 'clone', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
