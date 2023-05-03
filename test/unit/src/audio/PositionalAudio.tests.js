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

		// PROPERTIES
		QUnit.todo( 'panner', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'disconnect', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getOutput', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getRefDistance', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setRefDistance', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getRolloffFactor', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setRolloffFactor', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getDistanceModel', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setDistanceModel', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getMaxDistance', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setMaxDistance', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setDirectionalCone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'updateMatrixWorld', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
