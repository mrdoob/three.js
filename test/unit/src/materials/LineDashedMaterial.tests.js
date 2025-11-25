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

		QUnit.test( 'screenSpace', ( assert ) => {

			const material = new LineDashedMaterial();
			assert.strictEqual( material.screenSpace, false, 'screenSpace is false by default' );

			material.screenSpace = true;
			assert.strictEqual( material.screenSpace, true, 'screenSpace can be set to true' );

		} );

		// PUBLIC
		QUnit.test( 'isLineDashedMaterial', ( assert ) => {

			const object = new LineDashedMaterial();
			assert.ok(
				object.isLineDashedMaterial,
				'LineDashedMaterial.isLineDashedMaterial should be true'
			);

		} );

		QUnit.test( 'copy', ( assert ) => {

			const src = new LineDashedMaterial();
			src.screenSpace = true;
			src.dashSize = 5;
			src.gapSize = 2;
			src.scale = 3;

			const dst = new LineDashedMaterial();
			dst.copy( src );

			assert.strictEqual( dst.screenSpace, true, 'screenSpace copied' );
			assert.strictEqual( dst.dashSize, 5, 'dashSize copied' );
			assert.strictEqual( dst.gapSize, 2, 'gapSize copied' );
			assert.strictEqual( dst.scale, 3, 'scale copied' );

			// Verify independence
			src.screenSpace = false;
			assert.strictEqual( dst.screenSpace, true, 'copy is independent' );

		} );

	} );

} );
