import { assert, describe, test } from 'vitest';

import { LineDashedMaterial } from '../../../../src/materials/LineDashedMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'LineDashedMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new LineDashedMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'LineDashedMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new LineDashedMaterial();
			assert.ok( object, 'Can instantiate a LineDashedMaterial.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new LineDashedMaterial();
			assert.ok(
				object.type === 'LineDashedMaterial',
				'LineDashedMaterial.type should be LineDashedMaterial'
			);

		} );

		// PUBLIC
		test( 'isLineDashedMaterial', () => {

			const object = new LineDashedMaterial();
			assert.ok(
				object.isLineDashedMaterial,
				'LineDashedMaterial.isLineDashedMaterial should be true'
			);

		} );

	} );

} );
