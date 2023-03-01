/* global QUnit */

import { ColorKeyframeTrack } from '../../../../../src/animation/tracks/ColorKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'Tracks', () => {

		QUnit.module( 'ColorKeyframeTrack', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new ColorKeyframeTrack( '.material.diffuse', [ 0, 1 ], [ 0, 0.5, 1.0 ] );
				assert.strictEqual(
					object instanceof KeyframeTrack, true,
					'ColorKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			QUnit.todo( 'Instancing', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
