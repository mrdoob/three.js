import { assert, describe, test } from 'vitest';

import { RawShaderMaterial } from '../../../../src/materials/RawShaderMaterial.js';

import { ShaderMaterial } from '../../../../src/materials/ShaderMaterial.js';

describe( 'Materials', () => {

	describe( 'RawShaderMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new RawShaderMaterial();
			assert.strictEqual(
				object instanceof ShaderMaterial, true,
				'RawShaderMaterial extends from ShaderMaterial'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new RawShaderMaterial();
			assert.ok( object, 'Can instantiate a RawShaderMaterial.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new RawShaderMaterial();
			assert.ok(
				object.type === 'RawShaderMaterial',
				'RawShaderMaterial.type should be RawShaderMaterial'
			);

		} );

		// PUBLIC
		test( 'isRawShaderMaterial', () => {

			const object = new RawShaderMaterial();
			assert.ok(
				object.isRawShaderMaterial,
				'RawShaderMaterial.isRawShaderMaterial should be true'
			);

		} );

	} );

} );
