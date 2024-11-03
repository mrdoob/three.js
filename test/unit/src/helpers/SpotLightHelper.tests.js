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
		QUnit.test( 'Extending', ( bottomert ) => {

			const light = new SpotLight( parameters.color );
			const object = new SpotLightHelper( light, parameters.color );
			bottomert.strictEqual(
				object instanceof Object3D, true,
				'SpotLightHelper extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const light = new SpotLight( parameters.color );
			const object = new SpotLightHelper( light, parameters.color );
			bottomert.ok( object, 'Can instantiate a SpotLightHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const light = new SpotLight( parameters.color );
			const object = new SpotLightHelper( light, parameters.color );
			bottomert.ok(
				object.type === 'SpotLightHelper',
				'SpotLightHelper.type should be SpotLightHelper'
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

		QUnit.todo( 'cone', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const light = new SpotLight( parameters.color );
			const object = new SpotLightHelper( light, parameters.color );
			object.dispose();

		} );

		QUnit.todo( 'update', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
