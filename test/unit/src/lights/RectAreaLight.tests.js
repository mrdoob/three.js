/* global QUnit */

import { RectAreaLight } from '../../../../src/lights/RectAreaLight.js';

import { Light } from '../../../../src/lights/Light.js';
import { runStdLightTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'RectAreaLight', ( hooks ) => {

		let lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.5,
				width: 100,
				height: 50
			};

			lights = [
				new RectAreaLight( parameters.color ),
				new RectAreaLight( parameters.color, parameters.intensity ),
				new RectAreaLight( parameters.color, parameters.intensity, parameters.width ),
				new RectAreaLight( parameters.color, parameters.intensity, parameters.width, parameters.height )
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new RectAreaLight();
			assert.strictEqual(
				object instanceof Light, true,
				'RectAreaLight extends from Light'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new RectAreaLight();
			assert.ok( object, 'Can instantiate a RectAreaLight.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new RectAreaLight();
			assert.ok(
				object.type === 'RectAreaLight',
				'RectAreaLight.type should be RectAreaLight'
			);

		} );

		QUnit.todo( 'width', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'height', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'power', ( assert ) => {

			const a = new RectAreaLight( 0xaaaaaa, 1, 10, 10 );
			let actual = undefined;
			let expected = undefined;

			a.intensity = 100;
			actual = a.power;
			expected = 100 * a.width * a.height * Math.PI;
			assert.numEqual( actual, expected, 'Correct power for an intensity of 100' );

			a.intensity = 40;
			actual = a.power;
			expected = 40 * a.width * a.height * Math.PI;
			assert.numEqual( actual, expected, 'Correct power for an intensity of 40' );

			a.power = 100;
			actual = a.intensity;
			expected = 100 / ( a.width * a.height * Math.PI );
			assert.numEqual( actual, expected, 'Correct intensity for a power of 100' );

		} );

		// PUBLIC
		QUnit.test( 'isRectAreaLight', ( assert ) => {

			const object = new RectAreaLight();
			assert.ok(
				object.isRectAreaLight,
				'RectAreaLight.isRectAreaLight should be true'
			);

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard light tests', ( assert ) => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
