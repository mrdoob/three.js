/* global QUnit */

import { LineDashedMaterial } from '../../../../src/materials/LineDashedMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'LineDashedMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new LineDashedMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'LineDashedMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new LineDashedMaterial();
			assert.ok( object, 'Can instantiate a LineDashedMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new LineDashedMaterial();
			assert.ok(
				object.type === 'LineDashedMaterial',
				'LineDashedMaterial.type should be LineDashedMaterial'
			);

		} );

		QUnit.todo( 'scale', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'dashSize', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'gapSize', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isLineDashedMaterial', ( assert ) => {

			const object = new LineDashedMaterial();
			assert.ok(
				object.isLineDashedMaterial,
				'LineDashedMaterial.isLineDashedMaterial should be true'
			);

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
