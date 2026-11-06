import { assert, describe, test } from 'vitest';

import { Audio } from '../../../../src/audio/Audio.js';

import { Object3D } from '../../../../src/core/Object3D.js';

describe( 'Audios', () => {

	describe( 'Audio', () => {

		function mockListener() {

			return {
				context: {
					createGain: () => {

						return {
							connect: () => {},
						};

					}
				},
				getInput: () => {},
			};

		}

		// INHERITANCE
		test( 'Extending', () => {

			const listener = mockListener();
			const object = new Audio( listener );
			assert.strictEqual(
				object instanceof Object3D, true,
				'Audio extends from Object3D'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const listener = mockListener();
			const object = new Audio( listener );
			assert.ok( object, 'Can instantiate an Audio.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const listener = mockListener();
			const object = new Audio( listener );
			assert.ok(
				object.type === 'Audio',
				'Audio.type should be Audio'
			);

		} );

	} );

} );
