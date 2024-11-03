/* global QUnit */

import { ColorKeyframeTrack } from '../../../../../src/animation/tracks/ColorKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'Tracks', () => {

		QUnit.module( 'ColorKeyframeTrack', () => {

			const parameters = {
				name: '.material.diffuse',
				times: [ 0, 1 ],
				values: [ 0, 0.5, 1.0 ],
				interpolation: ColorKeyframeTrack.DefaultInterpolation
			};

			// INHERITANCE
			QUnit.test( 'Extending', ( bottomert ) => {

				const object = new ColorKeyframeTrack( parameters.name, parameters.times, parameters.values );
				bottomert.strictEqual(
					object instanceof KeyframeTrack, true,
					'ColorKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( bottomert ) => {

				// name, times, values
				const object = new ColorKeyframeTrack( parameters.name, parameters.times, parameters.values );
				bottomert.ok( object, 'Can instantiate a ColorKeyframeTrack.' );

				// name, times, values, interpolation
				const object_all = new ColorKeyframeTrack( parameters.name, parameters.times, parameters.values, parameters.interpolation );
				bottomert.ok( object_all, 'Can instantiate a ColorKeyframeTrack with name, times, values, interpolation.' );

			} );

		} );

	} );

} );
