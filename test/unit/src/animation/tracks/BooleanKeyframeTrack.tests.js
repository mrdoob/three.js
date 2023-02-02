/* global QUnit */

import { BooleanKeyframeTrack } from '../../../../../src/animation/tracks/BooleanKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'Tracks', () => {

		QUnit.module( 'BooleanKeyframeTrack', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new BooleanKeyframeTrack( '.visible', [ 0, 1 ], [ true, false ] );
				assert.strictEqual(
					object instanceof KeyframeTrack, true,
					'BooleanKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			QUnit.todo( 'Instancing', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
