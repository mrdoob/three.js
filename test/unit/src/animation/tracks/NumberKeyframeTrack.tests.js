/* global QUnit */

import { NumberKeyframeTrack } from '../../../../../src/animation/tracks/NumberKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'Tracks', () => {

		QUnit.module( 'NumberKeyframeTrack', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new NumberKeyframeTrack( '.material.opacity', [ 0, 1 ], [ 0, 0.5 ] );
				assert.strictEqual(
					object instanceof KeyframeTrack, true,
					'NumberKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			QUnit.todo( 'Instancing', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
