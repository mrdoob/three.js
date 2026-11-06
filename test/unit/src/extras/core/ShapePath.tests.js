import { assert, describe, test } from 'vitest';

import { ShapePath } from '../../../../../src/extras/core/ShapePath.js';

describe( 'Extras', () => {

	describe( 'Core', () => {

		describe( 'ShapePath', () => {

			// INSTANCING
			test( 'Instancing', () => {

				const object = new ShapePath();
				assert.ok( object, 'Can instantiate a ShapePath.' );

			} );

			// PROPERTIES
			test( 'type', () => {

				const object = new ShapePath();
				assert.ok(
					object.type === 'ShapePath',
					'ShapePath.type should be ShapePath'
				);

			} );

		} );

	} );

} );
