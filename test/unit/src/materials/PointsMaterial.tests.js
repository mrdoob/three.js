import { assert, describe, test } from 'vitest';

import { PointsMaterial } from '../../../../src/materials/PointsMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'PointsMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new PointsMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'PointsMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new PointsMaterial();
			assert.ok( object, 'Can instantiate a PointsMaterial.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new PointsMaterial();
			assert.ok(
				object.type === 'PointsMaterial',
				'PointsMaterial.type should be PointsMaterial'
			);

		} );

		// PUBLIC
		test( 'isPointsMaterial', () => {

			const object = new PointsMaterial();
			assert.ok(
				object.isPointsMaterial,
				'PointsMaterial.isPointsMaterial should be true'
			);

		} );

	} );

} );
