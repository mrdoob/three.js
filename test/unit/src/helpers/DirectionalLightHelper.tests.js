/* global QUnit */

import { DirectionalLightHelper } from '../../../../src/helpers/DirectionalLightHelper.js';

import { Object3D } from '../../../../src/core/Object3D.js';
import { DirectionalLight } from '../../../../src/lights/DirectionalLight.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'DirectionalLightHelper', () => {

		const parameters = {
			size: 1,
			color: 0xaaaaaa,
			intensity: 0.8
		};

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const light = new DirectionalLight( parameters.color );
			const object = new DirectionalLightHelper( light, parameters.size, parameters.color );
			assert.strictEqual(
				object instanceof Object3D, true,
				'DirectionalLightHelper extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const light = new DirectionalLight( parameters.color );
			const object = new DirectionalLightHelper( light, parameters.size, parameters.color );
			assert.ok( object, 'Can instantiate a DirectionalLightHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const light = new DirectionalLight( parameters.color );
			const object = new DirectionalLightHelper( light, parameters.size, parameters.color );
			assert.ok(
				object.type === 'DirectionalLightHelper',
				'DirectionalLightHelper.type should be DirectionalLightHelper'
			);

		} );

		QUnit.todo( 'light', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrix', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrixAutoUpdate', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'color', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const light = new DirectionalLight( parameters.color );
			const object = new DirectionalLightHelper( light, parameters.size, parameters.color );
			object.dispose();

		} );

		QUnit.todo( 'update', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
