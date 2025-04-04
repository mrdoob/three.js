/* global QUnit */

import { BooleanKeyframeTrack } from '../../../../../src/animation/tracks/BooleanKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'Tracks', () => {

		QUnit.module( 'BooleanKeyframeTrack', () => {

			const parameters = {
				name: '.visible',
				times: [ 0, 1 ],
				values: [ true, false ],
			};

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new BooleanKeyframeTrack( parameters.name, parameters.times, parameters.values );
				assert.strictEqual(
					object instanceof KeyframeTrack, true,
					'BooleanKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				// name, times, values
				const object = new BooleanKeyframeTrack( parameters.name, parameters.times, parameters.values );
				assert.ok( object, 'Can instantiate a BooleanKeyframeTrack.' );

			} );

		} );

	} );

} );
