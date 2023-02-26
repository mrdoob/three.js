/* global QUnit */

import { MeshPhongMaterial } from '../../../../src/materials/MeshPhongMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshPhongMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MeshPhongMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshPhongMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MeshPhongMaterial();
			assert.ok( object, 'Can instantiate a MeshPhongMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new MeshPhongMaterial();
			assert.ok(
				object.type === 'MeshPhongMaterial',
				'MeshPhongMaterial.type should be MeshPhongMaterial'
			);

		} );

		QUnit.todo( 'color', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'specular', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'shininess', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'map', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'lightMap', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'lightMapIntensity', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'aoMap', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'aoMapIntensity', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'emissive', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'emissiveIntensity', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'emissiveMap', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'bumpMap', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'bumpScale', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'normalMap', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'normalMapType', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'normalScale', ( assert ) => {

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

		QUnit.todo( 'specularMap', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'alphaMap', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'envMap', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'combine', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'reflectivity', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'refractionRatio', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'wireframe', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'wireframeLinewidth', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'wireframeLinecap', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'wireframeLinejoin', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'flatShading', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fog', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isMeshPhongMaterial', ( assert ) => {

			const object = new MeshPhongMaterial();
			assert.ok(
				object.isMeshPhongMaterial,
				'MeshPhongMaterial.isMeshPhongMaterial should be true'
			);

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
