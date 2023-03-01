/* global QUnit */

import { UniformsUtils } from '../../../../../src/renderers/shaders/UniformsUtils.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Shaders', () => {

		QUnit.module( 'UniformsUtils', () => {

			// INSTANCING - LEGACY
			QUnit.test( 'Instancing', ( assert ) => {

				assert.ok( UniformsUtils, 'UniformsUtils is defined.' );

			} );

			// LEGACY
			QUnit.todo( 'UniformsUtils.clone', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'UniformsUtils.merge', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			// PUBLIC
			QUnit.todo( 'cloneUniforms', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'mergeUniforms', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'cloneUniformsGroups', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getUnlitUniformColorSpace', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
