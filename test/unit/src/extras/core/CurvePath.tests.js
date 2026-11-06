import { assert, describe, test } from 'vitest';

import { CurvePath } from '../../../../../src/extras/core/CurvePath.js';

import { Curve } from '../../../../../src/extras/core/Curve.js';

describe( 'Extras', () => {

	describe( 'Core', () => {

		describe( 'CurvePath', () => {

			// INHERITANCE
			test( 'Extending', () => {

				const object = new CurvePath();
				assert.strictEqual(
					object instanceof Curve, true,
					'CurvePath extends from Curve'
				);

			} );

			// INSTANCING
			test( 'Instancing', () => {

				const object = new CurvePath();
				assert.ok( object, 'Can instantiate a CurvePath.' );

			} );

			// PROPERTIES
			test( 'type', () => {

				const object = new Curve();
				assert.ok(
					object.type === 'Curve',
					'Curve.type should be Curve'
				);

			} );

		} );

	} );

} );
