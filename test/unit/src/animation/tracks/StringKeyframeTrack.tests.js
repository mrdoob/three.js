/* global QUnit */

import { StringKeyframeTrack } from '../../../../../src/animation/tracks/StringKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'Tracks', () => {

		QUnit.module( 'StringKeyframeTrack', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new StringKeyframeTrack( '.name', [ 0, 1 ], [ 'foo', 'bar' ] );
				assert.strictEqual(
					object instanceof KeyframeTrack, true,
					'StringKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			QUnit.todo( 'Instancing', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
