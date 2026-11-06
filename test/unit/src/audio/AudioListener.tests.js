import { afterAll, assert, beforeAll, describe, test } from 'vitest';

import { AudioListener } from '../../../../src/audio/AudioListener.js';

import { Object3D } from '../../../../src/core/Object3D.js';

describe( 'Audios', () => {

	describe( 'AudioListener', () => {

		function mockWindowAudioContext() {

			global.window = {
				AudioContext: function () {

					return {
						createGain: () => {

							return {
								connect: () => {},
							};

						}
					};

				},
			};

		}

		if ( typeof window === 'undefined' ) {

			beforeAll( function () {

				mockWindowAudioContext();

			} );

			afterAll( function () {

				global.window = undefined;

			} );

		}

		// INHERITANCE
		test( 'Extending', () => {

			const object = new AudioListener();
			assert.strictEqual(
				object instanceof Object3D, true,
				'AudioListener extends from Object3D'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new AudioListener();
			assert.ok( object, 'Can instantiate an AudioListener.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new AudioListener();
			assert.ok(
				object.type === 'AudioListener',
				'AudioListener.type should be AudioListener'
			);

		} );

	} );

} );
