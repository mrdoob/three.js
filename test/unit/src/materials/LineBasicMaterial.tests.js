import { assert, describe, test } from 'vitest';

import { LineBasicMaterial } from '../../../../src/materials/LineBasicMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'LineBasicMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new LineBasicMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'LineBasicMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new LineBasicMaterial();
			assert.ok( object, 'Can instantiate a LineBasicMaterial.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new LineBasicMaterial();
			assert.ok(
				object.type === 'LineBasicMaterial',
				'LineBasicMaterial.type should be LineBasicMaterial'
			);

		} );

		// PUBLIC
		test( 'isLineBasicMaterial', () => {

			const object = new LineBasicMaterial();
			assert.ok(
				object.isLineBasicMaterial,
				'LineBasicMaterial.isLineBasicMaterial should be true'
			);

		} );

	} );

} );
