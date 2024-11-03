/* global QUnit */

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
		QUnit.test( 'Extending', ( bottomert ) => {

			const listener = mock3DListener();
			const object = new PositionalAudio( listener );
			bottomert.strictEqual(
				object instanceof Audio, true,
				'PositionalAudio extends from Audio'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const listener = mock3DListener();
			const object = new PositionalAudio( listener );
			bottomert.ok( object, 'Can instantiate a PositionalAudio.' );

		} );

		// PROPERTIES
		QUnit.todo( 'panner', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'disconnect', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getOutput', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getRefDistance', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setRefDistance', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getRolloffFactor', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setRolloffFactor', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getDistanceModel', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setDistanceModel', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getMaxDistance', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setMaxDistance', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setDirectionalCone', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'updateMatrixWorld', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
