/* global QUnit */

import { LineDashedMaterial } from '../../../../src/materials/LineDashedMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'LineDashedMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new LineDashedMaterial();
			bottomert.strictEqual(
				object instanceof Material, true,
				'LineDashedMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new LineDashedMaterial();
			bottomert.ok( object, 'Can instantiate a LineDashedMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new LineDashedMaterial();
			bottomert.ok(
				object.type === 'LineDashedMaterial',
				'LineDashedMaterial.type should be LineDashedMaterial'
			);

		} );

		QUnit.todo( 'scale', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'dashSize', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'gapSize', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isLineDashedMaterial', ( bottomert ) => {

			const object = new LineDashedMaterial();
			bottomert.ok(
				object.isLineDashedMaterial,
				'LineDashedMaterial.isLineDashedMaterial should be true'
			);

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
