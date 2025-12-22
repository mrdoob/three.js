import { PositionalAudio } from '../../../../src/audio/PositionalAudio.js';

import { Audio } from '../../../../src/audio/Audio.js';

export default QUnit.module( 'Audios', () => {

	QUnit.module( 'PositionalAudio', () => {

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
		QUnit.test( 'Extending', ( assert ) => {

			const listener = mock3DListener();
			const object = new PositionalAudio( listener );
			assert.strictEqual(
				object instanceof Audio, true,
				'PositionalAudio extends from Audio'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const listener = mock3DListener();
			const object = new PositionalAudio( listener );
			assert.ok( object, 'Can instantiate a PositionalAudio.' );

		} );

	} );

} );
