import { assert, describe, test } from 'vitest';

import { InstancedInterleavedBuffer } from '../../../../src/core/InstancedInterleavedBuffer.js';

import { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer.js';

describe( 'Core', () => {

	describe( 'InstancedInterleavedBuffer', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new InstancedInterleavedBuffer();
			assert.strictEqual(
				object instanceof InterleavedBuffer, true,
				'InstancedInterleavedBuffer extends from InterleavedBuffer'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			const instance = new InstancedInterleavedBuffer( array, 3 );

			assert.ok( instance.meshPerAttribute === 1, 'ok' );

		} );

		// PUBLIC
		test( 'isInstancedInterleavedBuffer', () => {

			const object = new InstancedInterleavedBuffer();
			assert.ok(
				object.isInstancedInterleavedBuffer,
				'InstancedInterleavedBuffer.isInstancedInterleavedBuffer should be true'
			);

		} );

		test( 'copy', () => {

			const array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			const instance = new InstancedInterleavedBuffer( array, 3 );
			const copiedInstance = instance.copy( instance );

			assert.ok( copiedInstance.meshPerAttribute === 1, 'additional attribute was copied' );

		} );

	} );

} );
