import { assert, describe, test } from 'vitest';

import { InterleavedBufferAttribute } from '../../../../src/core/InterleavedBufferAttribute.js';

import { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer.js';

describe( 'Core', () => {

	describe( 'InterleavedBufferAttribute', () => {

		// INSTANCING
		test( 'Instancing', () => {

			const object = new InterleavedBufferAttribute();
			assert.ok( object, 'Can instantiate an InterleavedBufferAttribute.' );

		} );

		// PROPERTIES

		test( 'count', () => {

			const buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );
			const instance = new InterleavedBufferAttribute( buffer, 2, 0 );

			assert.ok( instance.count === 2, 'count is calculated via array length / stride' );

		} );

		// PUBLIC
		test( 'isInterleavedBufferAttribute', () => {

			const object = new InterleavedBufferAttribute();
			assert.ok(
				object.isInterleavedBufferAttribute,
				'InterleavedBufferAttribute.isInterleavedBufferAttribute should be true'
			);

		} );

		// setY, setZ and setW are calculated in the same way so not testing this
		// TODO: ( you can't be sure that will be the case in future, or a mistake was introduce in one off them ! )
		test( 'setX', () => {

			let buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );
			let instance = new InterleavedBufferAttribute( buffer, 2, 0 );

			instance.setX( 0, 123 );
			instance.setX( 1, 321 );

			assert.ok( instance.data.array[ 0 ] === 123 &&
				instance.data.array[ 3 ] === 321, 'x was calculated correct based on index and default offset' );

			buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );
			instance = new InterleavedBufferAttribute( buffer, 2, 1 );

			instance.setX( 0, 123 );
			instance.setX( 1, 321 );

			// the offset was defined as 1, so go one step further in the array
			assert.ok( instance.data.array[ 1 ] === 123 &&
				instance.data.array[ 4 ] === 321, 'x was calculated correct based on index and default offset' );

		} );

	} );

} );
