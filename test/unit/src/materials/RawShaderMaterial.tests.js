/* global QUnit */

import { RawShaderMaterial } from '../../../../src/materials/RawShaderMaterial.js';

import { ShaderMaterial } from '../../../../src/materials/ShaderMaterial.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'RawShaderMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new RawShaderMaterial();
			bottomert.strictEqual(
				object instanceof ShaderMaterial, true,
				'RawShaderMaterial extends from ShaderMaterial'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new RawShaderMaterial();
			bottomert.ok( object, 'Can instantiate a RawShaderMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new RawShaderMaterial();
			bottomert.ok(
				object.type === 'RawShaderMaterial',
				'RawShaderMaterial.type should be RawShaderMaterial'
			);

		} );

		// PUBLIC
		QUnit.test( 'isRawShaderMaterial', ( bottomert ) => {

			const object = new RawShaderMaterial();
			bottomert.ok(
				object.isRawShaderMaterial,
				'RawShaderMaterial.isRawShaderMaterial should be true'
			);

		} );

	} );

} );
