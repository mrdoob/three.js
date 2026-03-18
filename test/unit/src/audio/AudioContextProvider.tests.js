import { AudioContextProvider } from '../../../../src/audio/AudioContextProvider.js';

export default QUnit.module( 'Audios', () => {

	QUnit.module( 'AudioContextProvider', ( hooks ) => {

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

			const context = AudioContextProvider.getContext();
			assert.strictEqual(
				context instanceof Object, true,
				'AudioContextProvider.getContext creates a context.'
			);

		} );

		QUnit.test( 'setContext', ( assert ) => {

			AudioContextProvider.setContext( new window.AudioContext() );
			const context = AudioContextProvider.getContext();
			assert.strictEqual(
				context instanceof Object, true,
				'AudioContextProvider.setContext updates the context.'
			);

		} );

	} );

} );
