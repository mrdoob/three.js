/* global QUnit */

import { ShadowMaterial } from '../../../../src/materials/ShadowMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'ShadowMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new ShadowMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'ShadowMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new ShadowMaterial();
			assert.ok( object, 'Can instantiate a ShadowMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new ShadowMaterial();
			assert.ok(
				object.type === 'ShadowMaterial',
				'ShadowMaterial.type should be ShadowMaterial'
			);

		} );

		QUnit.todo( 'color', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'transparent', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fog', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isShadowMaterial', ( assert ) => {

			const object = new ShadowMaterial();
			assert.ok(
				object.isShadowMaterial,
				'ShadowMaterial.isShadowMaterial should be true'
			);

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
