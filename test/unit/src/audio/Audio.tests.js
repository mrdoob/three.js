/* global QUnit */

import { Audio } from '../../../../src/audio/Audio.js';

import { Object3D } from '../../../../src/core/Object3D.js';

export default QUnit.module( 'Audios', () => {

	QUnit.module( 'Audio', () => {

		function mockListener() {

			return {
				context: {
					createGain: () => {

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

			const listener = mockListener();
			const object = new Audio( listener );
			assert.strictEqual(
				object instanceof Object3D, true,
				'Audio extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const listener = mockListener();
			const object = new Audio( listener );
			assert.ok( object, 'Can instantiate an Audio.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const listener = mockListener();
			const object = new Audio( listener );
			assert.ok(
				object.type === 'Audio',
				'Audio.type should be Audio'
			);

		} );

		QUnit.todo( 'listener', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'context', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'gain', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'autoplay', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'buffer', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'detune', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'loop', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'loopStart', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'loopEnd', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'offset', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'duration', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'playbackRate', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'isPlaying', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'hasPlaybackControl', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'source', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'sourceType', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'filters', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'getOutput', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setNodeSource', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setMediaElementSource', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setMediaStreamSource', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setBuffer', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'play', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pause', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'stop', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'connect', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'disconnect', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getFilters', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setFilters', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setDetune', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getDetune', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getFilter', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setFilter', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setPlaybackRate', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getPlaybackRate', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'onEnded', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getLoop', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setLoop', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setLoopStart', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setLoopEnd', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getVolume', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setVolume', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
