import { afterAll, assert, beforeAll, describe, test } from 'vitest';

import { AudioContext } from '../../../../src/audio/AudioContext.js';

describe( 'Audios', () => {

	describe( 'AudioContext', () => {

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

		// STATIC
		test( 'getContext', () => {

			const context = AudioContext.getContext();
			assert.strictEqual(
				context instanceof Object, true,
				'AudioContext.getContext creates a context.'
			);

		} );

		test( 'setContext', () => {

			AudioContext.setContext( new window.AudioContext() );
			const context = AudioContext.getContext();
			assert.strictEqual(
				context instanceof Object, true,
				'AudioContext.setContext updates the context.'
			);

		} );

	} );

} );
