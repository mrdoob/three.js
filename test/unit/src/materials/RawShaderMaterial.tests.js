/* global QUnit */

import { RawShaderMaterial } from '../../../../src/materials/RawShaderMaterial.js';

import { ShaderMaterial } from '../../../../src/materials/ShaderMaterial.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'RawShaderMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new RawShaderMaterial();
			assert.strictEqual(
				object instanceof ShaderMaterial, true,
				'RawShaderMaterial extends from ShaderMaterial'
			);

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new RawShaderMaterial();
			assert.ok(
				object.type === 'RawShaderMaterial',
				'RawShaderMaterial.type should be RawShaderMaterial'
			);

		} );

		// PUBLIC
		QUnit.test( 'isRawShaderMaterial', ( assert ) => {

			const object = new RawShaderMaterial();
			assert.ok(
				object.isRawShaderMaterial,
				'RawShaderMaterial.isRawShaderMaterial should be true'
			);

		} );

	} );

} );
