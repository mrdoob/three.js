/* global QUnit */

import { AudioContext } from '../../../../src/audio/AudioContext.js';

export default QUnit.module( 'Audios', () => {

	QUnit.module( 'AudioContext', ( hooks ) => {

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

			hooks.before( function () {

				mockWindowAudioContext();

			} );

			hooks.after( function () {

				global.window = undefined;

			} );

		}

		// STATIC
		QUnit.test( 'getContext', ( assert ) => {

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
