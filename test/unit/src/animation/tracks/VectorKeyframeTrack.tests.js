/* global QUnit */

import { VectorKeyframeTrack } from '../../../../../src/animation/tracks/VectorKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'Tracks', () => {

		QUnit.module( 'VectorKeyframeTrack', () => {

			const parameters = {
				name: '.force',
				times: [ 0 ],
				values: [ 0.5, 0.5, 0.5 ],
				interpolation: VectorKeyframeTrack.DefaultInterpolation
			};

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new VectorKeyframeTrack( parameters.name, parameters.times, parameters.values );
				assert.strictEqual(
					object instanceof KeyframeTrack, true,
					'VectorKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				// name, times, values
				const object = new VectorKeyframeTrack( parameters.name, parameters.times, parameters.values );
				assert.ok( object, 'Can instantiate a VectorKeyframeTrack.' );

				// name, times, values, interpolation
				const object_all = new VectorKeyframeTrack( parameters.name, parameters.times, parameters.values, parameters.interpolation );
				assert.ok( object_all, 'Can instantiate a VectorKeyframeTrack with name, times, values, interpolation.' );

			} );

		} );

	} );

} );
