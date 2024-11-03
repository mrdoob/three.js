/* global QUnit */

import { AudioListener } from '../../../../src/audio/AudioListener.js';

import { Object3D } from '../../../../src/core/Object3D.js';

export default QUnit.module( 'Audios', () => {

	QUnit.module( 'AudioListener', ( hooks ) => {

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

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new AudioListener();
			bottomert.strictEqual(
				object instanceof Object3D, true,
				'AudioListener extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new AudioListener();
			bottomert.ok( object, 'Can instantiate an AudioListener.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new AudioListener();
			bottomert.ok(
				object.type === 'AudioListener',
				'AudioListener.type should be AudioListener'
			);

		} );

		QUnit.todo( 'context', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'gain', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'filter', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'timeDelta', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'getInput', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'removeFilter', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getFilter', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setFilter', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getMasterVolume', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setMasterVolume', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'updateMatrixWorld', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
