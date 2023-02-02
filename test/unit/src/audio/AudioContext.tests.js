/* global QUnit */

import { AudioContext } from '../../../../src/audio/AudioContext.js';

export default QUnit.module( 'Audios', () => {

	QUnit.module( 'AudioContext', () => {

		function mockWindowAudioContext() {

			if ( typeof window === 'undefined' ) {

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

		}

		// STATIC
		QUnit.test( 'getContext', ( assert ) => {

			mockWindowAudioContext();

			const context = AudioContext.getContext();
			assert.strictEqual(
				context instanceof Object, true,
				'AudioContext.getContext creates a context.'
			);

		} );

		QUnit.test( 'setContext', ( assert ) => {

			AudioContext.setContext( new window.AudioContext() );
			const context = AudioContext.getContext();
			assert.strictEqual(
				context instanceof Object, true,
				'AudioContext.setContext updates the context.'
			);

		} );

	} );

} );
