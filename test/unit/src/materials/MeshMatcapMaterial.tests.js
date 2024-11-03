/* global QUnit */

import { MeshMatcapMaterial } from '../../../../src/materials/MeshMatcapMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshMatcapMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new MeshMatcapMaterial();

			bottomert.strictEqual(
				object instanceof Material, true,
				'MeshMatcapMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new MeshMatcapMaterial();
			bottomert.ok( object, 'Can instantiate a MeshMatcapMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'defines', ( bottomert ) => {

			const actual = new MeshMatcapMaterial().defines;
			const expected = { 'MATCAP': '' };
			bottomert.deepEqual( actual, expected, 'Contains a MATCAP definition.' );

		} );

		QUnit.test( 'type', ( bottomert ) => {

			const object = new MeshMatcapMaterial();
			bottomert.ok(
				object.type === 'MeshMatcapMaterial',
				'MeshMatcapMaterial.type should be MeshMatcapMaterial'
			);

		} );

		QUnit.todo( 'color', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matcap', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'map', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'bumpMap', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'bumpScale', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'normalMap', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'normalMapType', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'normalScale', ( bottomert ) => {

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

		QUnit.todo( 'alphaMap', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'flatShading', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fog', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isMeshMatcapMaterial', ( bottomert ) => {

			const object = new MeshMatcapMaterial();
			bottomert.ok(
				object.isMeshMatcapMaterial,
				'MeshMatcapMaterial.isMeshMatcapMaterial should be true'
			);

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
