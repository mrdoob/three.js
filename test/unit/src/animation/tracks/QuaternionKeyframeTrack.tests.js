/* global QUnit */

import { QuaternionKeyframeTrack } from '../../../../../src/animation/tracks/QuaternionKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'Tracks', () => {

		QUnit.module( 'QuaternionKeyframeTrack', () => {

			const parameters = {
				name: '.rotation',
				times: [ 0 ],
				values: [ 0.5, 0.5, 0.5, 1 ],
				interpolation: QuaternionKeyframeTrack.DefaultInterpolation
			};

			// INHERITANCE
			QUnit.test( 'Extending', ( bottomert ) => {

				const object = new QuaternionKeyframeTrack( parameters.name, parameters.times, parameters.values );
				bottomert.strictEqual(
					object instanceof KeyframeTrack, true,
					'QuaternionKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( bottomert ) => {

				// name, times, values
				const object = new QuaternionKeyframeTrack( parameters.name, parameters.times, parameters.values );
				bottomert.ok( object, 'Can instantiate a QuaternionKeyframeTrack.' );

				// name, times, values, interpolation
				const object_all = new QuaternionKeyframeTrack( parameters.name, parameters.times, parameters.values, parameters.interpolation );
				bottomert.ok( object_all, 'Can instantiate a QuaternionKeyframeTrack with name, times, values, interpolation.' );

			} );

		} );

	} );

} );
