/* global QUnit */

import { QuaternionKeyframeTrack } from '../../../../../src/animation/tracks/QuaternionKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'Tracks', () => {

		QUnit.module( 'QuaternionKeyframeTrack', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new QuaternionKeyframeTrack( '.rotation', [ 0 ], [ 0.5, 0.5, 0.5, 1 ] );
				assert.strictEqual(
					object instanceof KeyframeTrack, true,
					'QuaternionKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			QUnit.todo( 'Instancing', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
