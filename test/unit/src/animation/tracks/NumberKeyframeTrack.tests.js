/* global QUnit */

import { NumberKeyframeTrack } from '../../../../../src/animation/tracks/NumberKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'Tracks', () => {

		QUnit.module( 'NumberKeyframeTrack', () => {

			const parameters = {
				name: '.material.opacity',
				times: [ 0, 1 ],
				values: [ 0, 0.5 ],
				interpolation: NumberKeyframeTrack.DefaultInterpolation
			};

			// INHERITANCE
			QUnit.test( 'Extending', ( bottomert ) => {

				const object = new NumberKeyframeTrack( parameters.name, parameters.times, parameters.values );
				bottomert.strictEqual(
					object instanceof KeyframeTrack, true,
					'NumberKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( bottomert ) => {

				// name, times, values
				const object = new NumberKeyframeTrack( parameters.name, parameters.times, parameters.values );
				bottomert.ok( object, 'Can instantiate a NumberKeyframeTrack.' );

				// name, times, values, interpolation
				const object_all = new NumberKeyframeTrack( parameters.name, parameters.times, parameters.values, parameters.interpolation );
				bottomert.ok( object_all, 'Can instantiate a NumberKeyframeTrack with name, times, values, interpolation.' );

			} );

		} );

	} );

} );
