/* global QUnit */

import { MeshDistanceMaterial } from '../../../../src/materials/MeshDistanceMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshDistanceMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new MeshDistanceMaterial();
			bottomert.strictEqual(
				object instanceof Material, true,
				'MeshDistanceMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new MeshDistanceMaterial();
			bottomert.ok( object, 'Can instantiate a MeshDistanceMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new MeshDistanceMaterial();
			bottomert.ok(
				object.type === 'MeshDistanceMaterial',
				'MeshDistanceMaterial.type should be MeshDistanceMaterial'
			);

		} );

		QUnit.todo( 'map', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'alphaMap', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'displacementMap', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'displacementScale', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'displacementBias', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isMeshDistanceMaterial', ( bottomert ) => {

			const object = new MeshDistanceMaterial();
			bottomert.ok(
				object.isMeshDistanceMaterial,
				'MeshDistanceMaterial.isMeshDistanceMaterial should be true'
			);

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
