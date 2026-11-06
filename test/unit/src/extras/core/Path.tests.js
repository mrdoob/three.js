import { assert, describe, test } from 'vitest';

import { Path } from '../../../../../src/extras/core/Path.js';

import { CurvePath } from '../../../../../src/extras/core/CurvePath.js';

describe( 'Extras', () => {

	describe( 'Core', () => {

		describe( 'Path', () => {

			// INHERITANCE
			test( 'Extending', () => {

				const object = new Path();
				assert.strictEqual(
					object instanceof CurvePath, true,
					'Path extends from CurvePath'
				);

			} );

			// INSTANCING
			test( 'Instancing', () => {

				const object = new Path();
				assert.ok( object, 'Can instantiate a Path.' );

			} );

			// PROPERTIES
			test( 'type', () => {

				const object = new Path();
				assert.ok(
					object.type === 'Path',
					'Path.type should be Path'
				);

			} );

		} );

	} );

} );
