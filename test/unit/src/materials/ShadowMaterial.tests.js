/* global QUnit */

import { ShadowMaterial } from '../../../../src/materials/ShadowMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'ShadowMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new ShadowMaterial();
			bottomert.strictEqual(
				object instanceof Material, true,
				'ShadowMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new ShadowMaterial();
			bottomert.ok( object, 'Can instantiate a ShadowMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new ShadowMaterial();
			bottomert.ok(
				object.type === 'ShadowMaterial',
				'ShadowMaterial.type should be ShadowMaterial'
			);

		} );

		QUnit.todo( 'color', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'transparent', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fog', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isShadowMaterial', ( bottomert ) => {

			const object = new ShadowMaterial();
			bottomert.ok(
				object.isShadowMaterial,
				'ShadowMaterial.isShadowMaterial should be true'
			);

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
