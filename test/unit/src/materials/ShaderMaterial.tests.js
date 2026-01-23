import { ShaderMaterial } from '../../../../src/materials/ShaderMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'ShaderMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new ShaderMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'ShaderMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new ShaderMaterial();
			assert.ok( object, 'Can instantiate a ShaderMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new ShaderMaterial();
			assert.ok(
				object.type === 'ShaderMaterial',
				'ShaderMaterial.type should be ShaderMaterial'
			);

		} );

		// PUBLIC
		QUnit.test( 'isShaderMaterial', ( assert ) => {

			const object = new ShaderMaterial();
			assert.ok(
				object.isShaderMaterial,
				'ShaderMaterial.isShaderMaterial should be true'
			);

		} );

	} );

} );
