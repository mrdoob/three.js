/* global QUnit */

import { runStdLightTests } from '../../utils/qunit-utils';
import { PointLight } from '../../../../src/lights/PointLight';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'PointLight', ( hooks ) => {

		var lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.5,
				distance: 100,
				decay: 2
			};

			lights = [
				new PointLight(),
				new PointLight( parameters.color ),
				new PointLight( parameters.color, parameters.intensity ),
				new PointLight( parameters.color, parameters.intensity, parameters.distance ),
				new PointLight( parameters.color, parameters.intensity, parameters.distance, parameters.decay )
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

			var a = new PointLight( 0xaaaaaa );

			a.intensity = 100;
			assert.numEqual( a.power, 100 * Math.PI * 4, 'Correct power for an intensity of 100' );

			a.intensity = 40;
			assert.numEqual( a.power, 40 * Math.PI * 4, 'Correct power for an intensity of 40' );

			a.power = 100;
			assert.numEqual( a.intensity, 100 / ( 4 * Math.PI ), 'Correct intensity for a power of 100' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'isPointLight', ( assert ) => {

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
