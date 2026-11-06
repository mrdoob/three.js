import { assert, describe, test } from 'vitest';

import { SphericalHarmonics3 } from '../../../../src/math/SphericalHarmonics3.js';

describe( 'Maths', () => {

	describe( 'SphericalHarmonics3', () => {

		// INSTANCING
		test( 'Instancing', () => {

			const object = new SphericalHarmonics3();
			assert.ok( object, 'Can instantiate a SphericalHarmonics3.' );

		} );

		// PUBLIC
		test( 'isSphericalHarmonics3', () => {

			const object = new SphericalHarmonics3();
			assert.ok(
				object.isSphericalHarmonics3,
				'SphericalHarmonics3.isSphericalHarmonics3 should be true'
			);

		} );

		// PUBLIC - STATIC

	} );

} );
