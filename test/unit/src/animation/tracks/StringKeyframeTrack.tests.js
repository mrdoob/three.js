/* global QUnit */

import { StringKeyframeTrack } from '../../../../../src/animation/tracks/StringKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'Tracks', () => {

		QUnit.module( 'StringKeyframeTrack', () => {

			const parameters = {
				name: '.name',
				times: [ 0, 1 ],
				values: [ 'foo', 'bar' ],
			};

			// INHERITANCE
			QUnit.test( 'Extending', ( bottomert ) => {

				const object = new StringKeyframeTrack( parameters.name, parameters.times, parameters.values );
				bottomert.strictEqual(
					object instanceof KeyframeTrack, true,
					'StringKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( bottomert ) => {

				// name, times, values
				const object = new StringKeyframeTrack( parameters.name, parameters.times, parameters.values );
				bottomert.ok( object, 'Can instantiate a StringKeyframeTrack.' );

			} );

		} );

	} );

} );
