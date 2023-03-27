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
				interpolation: StringKeyframeTrack.DefaultInterpolation
			};

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new StringKeyframeTrack( parameters.name, parameters.times, parameters.values );
				assert.strictEqual(
					object instanceof KeyframeTrack, true,
					'StringKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				// name, times, values
				const object = new StringKeyframeTrack( parameters.name, parameters.times, parameters.values );
				assert.ok( object, 'Can instantiate a StringKeyframeTrack.' );

				// name, times, values, interpolation
				const object_all = new StringKeyframeTrack( parameters.name, parameters.times, parameters.values, parameters.interpolation );
				assert.ok( object_all, 'Can instantiate a StringKeyframeTrack with name, times, values, interpolation.' );

			} );

		} );

	} );

} );
