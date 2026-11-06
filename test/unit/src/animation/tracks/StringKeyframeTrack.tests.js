import { assert, describe, test } from 'vitest';

import { StringKeyframeTrack } from '../../../../../src/animation/tracks/StringKeyframeTrack.js';

import { KeyframeTrack } from '../../../../../src/animation/KeyframeTrack.js';

describe( 'Animation', () => {

	describe( 'Tracks', () => {

		describe( 'StringKeyframeTrack', () => {

			const parameters = {
				name: '.name',
				times: [ 0, 1 ],
				values: [ 'foo', 'bar' ],
			};

			// INHERITANCE
			test( 'Extending', () => {

				const object = new StringKeyframeTrack( parameters.name, parameters.times, parameters.values );
				assert.strictEqual(
					object instanceof KeyframeTrack, true,
					'StringKeyframeTrack extends from KeyframeTrack'
				);

			} );

			// INSTANCING
			test( 'Instancing', () => {

				// name, times, values
				const object = new StringKeyframeTrack( parameters.name, parameters.times, parameters.values );
				assert.ok( object, 'Can instantiate a StringKeyframeTrack.' );

			} );

		} );

	} );

} );
