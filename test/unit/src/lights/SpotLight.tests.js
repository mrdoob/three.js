/* global QUnit */

import { SpotLight } from '../../../../src/lights/SpotLight.js';

import { Light } from '../../../../src/lights/Light.js';
import { runStdLightTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'SpotLight', ( hooks ) => {

		let lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.5,
				distance: 100,
				angle: 0.8,
				penumbra: 8,
				decay: 2
			};

			lights = [
				new SpotLight( parameters.color ),
				new SpotLight( parameters.color, parameters.intensity ),
				new SpotLight( parameters.color, parameters.intensity, parameters.distance ),
				new SpotLight( parameters.color, parameters.intensity, parameters.distance, parameters.angle ),
				new SpotLight( parameters.color, parameters.intensity, parameters.distance, parameters.angle, parameters.penumbra ),
				new SpotLight( parameters.color, parameters.intensity, parameters.distance, parameters.angle, parameters.penumbra, parameters.decay ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new SpotLight();
			bottomert.strictEqual(
				object instanceof Light, true,
				'SpotLight extends from Light'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new SpotLight();
			bottomert.ok( object, 'Can instantiate a SpotLight.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new SpotLight();
			bottomert.ok(
				object.type === 'SpotLight',
				'SpotLight.type should be SpotLight'
			);

		} );

		QUnit.todo( 'position', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'target', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'distance', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'angle', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'penumbra', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'decay', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'map', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'shadow', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'power', ( bottomert ) => {

			const a = new SpotLight( 0xaaaaaa );

			a.intensity = 100;
			bottomert.numEqual( a.power, 100 * Math.PI, 'Correct power for an intensity of 100' );

			a.intensity = 40;
			bottomert.numEqual( a.power, 40 * Math.PI, 'Correct power for an intensity of 40' );

			a.power = 100;
			bottomert.numEqual( a.intensity, 100 / Math.PI, 'Correct intensity for a power of 100' );

		} );

		// PUBLIC
		QUnit.test( 'isSpotLight', ( bottomert ) => {

			const object = new SpotLight();
			bottomert.ok(
				object.isSpotLight,
				'SpotLight.isSpotLight should be true'
			);

		} );

		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const object = new SpotLight();
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
