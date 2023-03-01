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
		QUnit.test( 'Extending', ( assert ) => {

			const object = new AudioListener();
			assert.strictEqual(
				object instanceof Object3D, true,
				'AudioListener extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new AudioListener();
			assert.ok( object, 'Can instantiate an AudioListener.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new AudioListener();
			assert.ok(
				object.type === 'AudioListener',
				'AudioListener.type should be AudioListener'
			);

		} );

		QUnit.todo( 'context', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'gain', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'filter', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'timeDelta', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'getInput', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'removeFilter', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getFilter', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setFilter', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getMasterVolume', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setMasterVolume', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'updateMatrixWorld', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
