/* global QUnit */

import { SpotLightHelper } from '../../../../src/helpers/SpotLightHelper.js';

import { Object3D } from '../../../../src/core/Object3D.js';
import { SpotLight } from '../../../../src/lights/SpotLight.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'SpotLightHelper', () => {

		const parameters = {
			color: 0xaaaaaa,
			intensity: 0.5,
			distance: 100,
			angle: 0.8,
			penumbra: 8,
			decay: 2
		};

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const light = new SpotLight( parameters.color );
			const object = new SpotLightHelper( light, parameters.color );
			assert.strictEqual(
				object instanceof Object3D, true,
				'SpotLightHelper extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const light = new SpotLight( parameters.color );
			const object = new SpotLightHelper( light, parameters.color );
			assert.ok( object, 'Can instantiate a SpotLightHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const light = new SpotLight( parameters.color );
			const object = new SpotLightHelper( light, parameters.color );
			assert.ok(
				object.type === 'SpotLightHelper',
				'SpotLightHelper.type should be SpotLightHelper'
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

		QUnit.todo( 'cone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const light = new SpotLight( parameters.color );
			const object = new SpotLightHelper( light, parameters.color );
			object.dispose();

		} );

		QUnit.todo( 'update', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
