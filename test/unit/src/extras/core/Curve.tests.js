import { assert, describe, test } from 'vitest';

import { Curve } from '../../../../../src/extras/core/Curve.js';

describe( 'Extras', () => {

	describe( 'Core', () => {

		describe( 'Curve', () => {

			// INSTANCING
			test( 'Instancing', () => {

				const object = new Curve();
				assert.ok( object, 'Can instantiate a Curve.' );

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
