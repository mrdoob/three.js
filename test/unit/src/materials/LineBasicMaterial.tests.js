/* global QUnit */

import { LineBasicMaterial } from '../../../../src/materials/LineBasicMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'LineBasicMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new LineBasicMaterial();
			bottomert.strictEqual(
				object instanceof Material, true,
				'LineBasicMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new LineBasicMaterial();
			bottomert.ok( object, 'Can instantiate a LineBasicMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new LineBasicMaterial();
			bottomert.ok(
				object.type === 'LineBasicMaterial',
				'LineBasicMaterial.type should be LineBasicMaterial'
			);

		} );

		QUnit.todo( 'color', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'linewidth', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'linecap', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'linejoin', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fog', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isLineBasicMaterial', ( bottomert ) => {

			const object = new LineBasicMaterial();
			bottomert.ok(
				object.isLineBasicMaterial,
				'LineBasicMaterial.isLineBasicMaterial should be true'
			);

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
