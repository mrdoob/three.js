import { assert, describe, test } from 'vitest';

import { PositionalAudio } from '../../../../src/audio/PositionalAudio.js';

import { Audio } from '../../../../src/audio/Audio.js';

describe( 'Audios', () => {

	describe( 'PositionalAudio', () => {

		function mock3DListener() {

			return {
				context: {
					createGain: () => {

						return {
							connect: () => {},
						};

					},
					createPanner: () => {

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

			const listener = mock3DListener();
			const object = new PositionalAudio( listener );
			assert.strictEqual(
				object instanceof Audio, true,
				'PositionalAudio extends from Audio'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const listener = mock3DListener();
			const object = new PositionalAudio( listener );
			assert.ok( object, 'Can instantiate a PositionalAudio.' );

		} );

	} );

} );
