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
		QUnit.test( 'Extending', ( assert ) => {

			const object = new SpotLight();
			assert.strictEqual(
				object instanceof Light, true,
				'SpotLight extends from Light'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new SpotLight();
			assert.ok( object, 'Can instantiate a SpotLight.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new SpotLight();
			assert.ok(
				object.type === 'SpotLight',
				'SpotLight.type should be SpotLight'
			);

		} );

		QUnit.todo( 'position', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'target', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'distance', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'angle', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'penumbra', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'decay', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'map', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'shadow', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'power', ( assert ) => {

			const a = new SpotLight( 0xaaaaaa );

			a.intensity = 100;
			assert.numEqual( a.power, 100 * Math.PI, 'Correct power for an intensity of 100' );

			a.intensity = 40;
			assert.numEqual( a.power, 40 * Math.PI, 'Correct power for an intensity of 40' );

			a.power = 100;
			assert.numEqual( a.intensity, 100 / Math.PI, 'Correct intensity for a power of 100' );

		} );

		// PUBLIC
		QUnit.test( 'isSpotLight', ( assert ) => {

			const object = new SpotLight();
			assert.ok(
				object.isSpotLight,
				'SpotLight.isSpotLight should be true'
			);

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new SpotLight();
			object.dispose();

			// ensure calls dispose() on shadow

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard light tests', ( assert ) => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
