import { assert, describe, test } from 'vitest';

import { BooleanKeyframeTrack } from '../../../../../src/animation/tracks/BooleanKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

describe( 'Animation', () => {

	describe( 'Tracks', () => {

		describe( 'BooleanKeyframeTrack', () => {

			const parameters = {
				name: '.visible',
				times: [ 0, 1 ],
				values: [ true, false ],
			};

			// INHERITANCE
			test( 'Extending', () => {

				const object = new BooleanKeyframeTrack( parameters.name, parameters.times, parameters.values );
				assert.strictEqual(
					object instanceof KeyframeTrack, true,
					'BooleanKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			test( 'Instancing', () => {

				// name, times, values
				const object = new BooleanKeyframeTrack( parameters.name, parameters.times, parameters.values );
				assert.ok( object, 'Can instantiate a BooleanKeyframeTrack.' );

			} );

		} );

	} );

} );
