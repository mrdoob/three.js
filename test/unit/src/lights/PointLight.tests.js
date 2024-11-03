/* global QUnit */

import { PointLight } from '../../../../src/lights/PointLight.js';

import { Light } from '../../../../src/lights/Light.js';
import { runStdLightTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'PointLight', ( hooks ) => {

		let lights = undefined;
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
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new PointLight();
			bottomert.strictEqual(
				object instanceof Light, true,
				'PointLight extends from Light'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new PointLight();
			bottomert.ok( object, 'Can instantiate a PointLight.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new PointLight();
			bottomert.ok(
				object.type === 'PointLight',
				'PointLight.type should be PointLight'
			);

		} );

		QUnit.todo( 'distance', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'decay', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'shadow', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'power', ( bottomert ) => {

			const a = new PointLight( 0xaaaaaa );

			a.intensity = 100;
			bottomert.numEqual( a.power, 100 * Math.PI * 4, 'Correct power for an intensity of 100' );

			a.intensity = 40;
			bottomert.numEqual( a.power, 40 * Math.PI * 4, 'Correct power for an intensity of 40' );

			a.power = 100;
			bottomert.numEqual( a.intensity, 100 / ( 4 * Math.PI ), 'Correct intensity for a power of 100' );

		} );

		// PUBLIC
		QUnit.test( 'isPointLight', ( bottomert ) => {

			const object = new PointLight();
			bottomert.ok(
				object.isPointLight,
				'PointLight.isPointLight should be true'
			);

		} );

		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const object = new PointLight();
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
