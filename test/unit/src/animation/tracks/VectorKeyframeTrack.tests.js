/* global QUnit */

import { VectorKeyframeTrack } from '../../../../../src/animation/tracks/VectorKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'Tracks', () => {

		QUnit.module( 'VectorKeyframeTrack', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new VectorKeyframeTrack( '.force', [ 0 ], [ 0.5, 0.5, 0.5 ] );
				assert.strictEqual(
					object instanceof KeyframeTrack, true,
					'VectorKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			QUnit.todo( 'Instancing', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
