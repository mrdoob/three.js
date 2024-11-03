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
		QUnit.test( 'Extending', ( bottomert ) => {

			const light = new DirectionalLight( parameters.color );
			const object = new DirectionalLightHelper( light, parameters.size, parameters.color );
			bottomert.strictEqual(
				object instanceof Object3D, true,
				'DirectionalLightHelper extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const light = new DirectionalLight( parameters.color );
			const object = new DirectionalLightHelper( light, parameters.size, parameters.color );
			bottomert.ok( object, 'Can instantiate a DirectionalLightHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const light = new DirectionalLight( parameters.color );
			const object = new DirectionalLightHelper( light, parameters.size, parameters.color );
			bottomert.ok(
				object.type === 'DirectionalLightHelper',
				'DirectionalLightHelper.type should be DirectionalLightHelper'
			);

		} );

		QUnit.todo( 'light', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrix', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrixAutoUpdate', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'color', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const light = new DirectionalLight( parameters.color );
			const object = new DirectionalLightHelper( light, parameters.size, parameters.color );
			object.dispose();

		} );

		QUnit.todo( 'update', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
