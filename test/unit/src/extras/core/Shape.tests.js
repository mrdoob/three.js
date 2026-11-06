import { assert, describe, test } from 'vitest';

import { Shape } from '../../../../../src/extras/core/Shape.js';

import { Path } from '../../../../../src/extras/core/Path.js';

describe( 'Extras', () => {

	describe( 'Core', () => {

		describe( 'Shape', () => {

			// INHERITANCE
			test( 'Extending', () => {

				const object = new Shape();
				assert.strictEqual(
					object instanceof Path, true,
					'Shape extends from Path'
				);

			} );

			// INSTANCING
			test( 'Instancing', () => {

				const object = new Shape();
				assert.ok( object, 'Can instantiate a Shape.' );

			} );

			// PROPERTIES
			test( 'type', () => {

				const object = new Shape();
				assert.ok(
					object.type === 'Shape',
					'Shape.type should be Shape'
				);

			} );

		} );

	} );

} );
