/* global QUnit */

import { runStdLightTests } from '../../utils/qunit-utils.js';
import { SpotLight } from '../../../../src/lights/SpotLight.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'SpotLight', ( hooks ) => {

		var lights = undefined;
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
		QUnit.todo( 'Extending', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PROPERTIES
		QUnit.test( 'power', ( assert ) => {

			var a = new SpotLight( 0xaaaaaa );

			a.intensity = 100;
			assert.numEqual( a.power, 100 * Math.PI, 'Correct power for an intensity of 100' );

			a.intensity = 40;
			assert.numEqual( a.power, 40 * Math.PI, 'Correct power for an intensity of 40' );

			a.power = 100;
			assert.numEqual( a.intensity, 100 / Math.PI, 'Correct intensity for a power of 100' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'isSpotLight', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

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
