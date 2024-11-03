/* global QUnit */

import { DirectionalLight } from '../../../../src/lights/DirectionalLight.js';

import { Light } from '../../../../src/lights/Light.js';
import { runStdLightTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'DirectionalLight', ( hooks ) => {

		let lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.8
			};

			lights = [
				new DirectionalLight(),
				new DirectionalLight( parameters.color ),
				new DirectionalLight( parameters.color, parameters.intensity )
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new DirectionalLight();
			bottomert.strictEqual(
				object instanceof Light, true,
				'DirectionalLight extends from Light'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new DirectionalLight();
			bottomert.ok( object, 'Can instantiate a DirectionalLight.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new DirectionalLight();
			bottomert.ok(
				object.type === 'DirectionalLight',
				'DirectionalLight.type should be DirectionalLight'
			);

		} );

		QUnit.todo( 'position', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'target', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'shadow', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isDirectionalLight', ( bottomert ) => {

			const object = new DirectionalLight();
			bottomert.ok(
				object.isDirectionalLight,
				'DirectionalLight.isDirectionalLight should be true'
			);

		} );

		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const object = new DirectionalLight();
			object.dispose();

			// ensure calls dispose() on shadow

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard light tests', ( bottomert ) => {

			runStdLightTests( bottomert, lights );

		} );

	} );

} );
