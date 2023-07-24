/* global QUnit */

import { ShaderMaterial } from '../../../../src/materials/ShaderMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'ShaderMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new ShaderMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'ShaderMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new ShaderMaterial();
			assert.ok( object, 'Can instantiate a ShaderMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new ShaderMaterial();
			assert.ok(
				object.type === 'ShaderMaterial',
				'ShaderMaterial.type should be ShaderMaterial'
			);

		} );

		QUnit.todo( 'defines', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uniforms', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uniformsGroups', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'vertexShader', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fragmentShader', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'linewidth', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'wireframe', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'wireframeLinewidth', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fog', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'lights', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clipping', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'extensions', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'defaultAttributeValues', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'index0AttributeName', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uniformsNeedUpdate', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'glslVersion', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isShaderMaterial', ( assert ) => {

			const object = new ShaderMaterial();
			assert.ok(
				object.isShaderMaterial,
				'ShaderMaterial.isShaderMaterial should be true'
			);

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
