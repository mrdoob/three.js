import { assert, describe, test } from 'vitest';

import { ShaderMaterial } from '../../../../src/materials/ShaderMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'ShaderMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new ShaderMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'ShaderMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new ShaderMaterial();
			assert.ok( object, 'Can instantiate a ShaderMaterial.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new ShaderMaterial();
			assert.ok(
				object.type === 'ShaderMaterial',
				'ShaderMaterial.type should be ShaderMaterial'
			);

		} );

		// PUBLIC
		test( 'isShaderMaterial', () => {

			const object = new ShaderMaterial();
			assert.ok(
				object.isShaderMaterial,
				'ShaderMaterial.isShaderMaterial should be true'
			);

		} );

	} );

} );
