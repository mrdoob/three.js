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
		QUnit.test( 'Extending', ( assert ) => {

			const object = new PointLight();
			assert.strictEqual(
				object instanceof Light, true,
				'PointLight extends from Light'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new PointLight();
			assert.ok( object, 'Can instantiate a PointLight.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new PointLight();
			assert.ok(
				object.type === 'PointLight',
				'PointLight.type should be PointLight'
			);

		} );

		QUnit.todo( 'distance', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'decay', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'shadow', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'power', ( assert ) => {

			const a = new PointLight( 0xaaaaaa );

			a.intensity = 100;
			assert.numEqual( a.power, 100 * Math.PI * 4, 'Correct power for an intensity of 100' );

			a.intensity = 40;
			assert.numEqual( a.power, 40 * Math.PI * 4, 'Correct power for an intensity of 40' );

			a.power = 100;
			assert.numEqual( a.intensity, 100 / ( 4 * Math.PI ), 'Correct intensity for a power of 100' );

		} );

		// PUBLIC
		QUnit.test( 'isPointLight', ( assert ) => {

			const object = new PointLight();
			assert.ok(
				object.isPointLight,
				'PointLight.isPointLight should be true'
			);

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new PointLight();
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
