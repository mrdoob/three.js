/* global QUnit */

import { MeshDistanceMaterial } from '../../../../src/materials/MeshDistanceMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshDistanceMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MeshDistanceMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshDistanceMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MeshDistanceMaterial();
			assert.ok( object, 'Can instantiate a MeshDistanceMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new MeshDistanceMaterial();
			assert.ok(
				object.type === 'MeshDistanceMaterial',
				'MeshDistanceMaterial.type should be MeshDistanceMaterial'
			);

		} );

		QUnit.todo( 'map', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'alphaMap', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'displacementMap', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'displacementScale', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'displacementBias', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isMeshDistanceMaterial', ( assert ) => {

			const object = new MeshDistanceMaterial();
			assert.ok(
				object.isMeshDistanceMaterial,
				'MeshDistanceMaterial.isMeshDistanceMaterial should be true'
			);

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
