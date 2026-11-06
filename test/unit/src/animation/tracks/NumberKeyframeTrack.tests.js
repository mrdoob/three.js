import { assert, describe, test } from 'vitest';

import { NumberKeyframeTrack } from '../../../../../src/animation/tracks/NumberKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

describe( 'Animation', () => {

	describe( 'Tracks', () => {

		describe( 'NumberKeyframeTrack', () => {

			const parameters = {
				name: '.material.opacity',
				times: [ 0, 1 ],
				values: [ 0, 0.5 ],
				interpolation: NumberKeyframeTrack.DefaultInterpolation
			};

			// INHERITANCE
			test( 'Extending', () => {

				const object = new NumberKeyframeTrack( parameters.name, parameters.times, parameters.values );
				assert.strictEqual(
					object instanceof KeyframeTrack, true,
					'NumberKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			test( 'Instancing', () => {

				// name, times, values
				const object = new NumberKeyframeTrack( parameters.name, parameters.times, parameters.values );
				assert.ok( object, 'Can instantiate a NumberKeyframeTrack.' );

				// name, times, values, interpolation
				const object_all = new NumberKeyframeTrack( parameters.name, parameters.times, parameters.values, parameters.interpolation );
				assert.ok( object_all, 'Can instantiate a NumberKeyframeTrack with name, times, values, interpolation.' );

			} );

		} );

	} );

} );
