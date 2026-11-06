import { assert, describe, test } from 'vitest';

import { ColorKeyframeTrack } from '../../../../../src/animation/tracks/ColorKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

describe( 'Animation', () => {

	describe( 'Tracks', () => {

		describe( 'ColorKeyframeTrack', () => {

			const parameters = {
				name: '.material.diffuse',
				times: [ 0, 1 ],
				values: [ 0, 0.5, 1.0 ],
				interpolation: ColorKeyframeTrack.DefaultInterpolation
			};

			// INHERITANCE
			test( 'Extending', () => {

				const object = new ColorKeyframeTrack( parameters.name, parameters.times, parameters.values );
				assert.strictEqual(
					object instanceof KeyframeTrack, true,
					'ColorKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			test( 'Instancing', () => {

				// name, times, values
				const object = new ColorKeyframeTrack( parameters.name, parameters.times, parameters.values );
				assert.ok( object, 'Can instantiate a ColorKeyframeTrack.' );

				// name, times, values, interpolation
				const object_all = new ColorKeyframeTrack( parameters.name, parameters.times, parameters.values, parameters.interpolation );
				assert.ok( object_all, 'Can instantiate a ColorKeyframeTrack with name, times, values, interpolation.' );

			} );

		} );

	} );

} );
