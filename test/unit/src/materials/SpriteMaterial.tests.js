/* global QUnit */

import { SpriteMaterial } from '../../../../src/materials/SpriteMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'SpriteMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new SpriteMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'SpriteMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new SpriteMaterial();
			assert.ok( object, 'Can instantiate a SpriteMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new SpriteMaterial();
			assert.ok(
				object.type === 'SpriteMaterial',
				'SpriteMaterial.type should be SpriteMaterial'
			);

		} );

		QUnit.todo( 'color', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'map', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'alphaMap', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'rotation', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'sizeAttenuation', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'transparent', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fog', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isSpriteMaterial', ( assert ) => {

			const object = new SpriteMaterial();
			assert.ok(
				object.isSpriteMaterial,
				'SpriteMaterial.isSpriteMaterial should be true'
			);

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
