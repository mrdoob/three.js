import { beforeEach, describe, test } from 'vitest';
import { assert, runStdLightTests } from '../../utils/test-utils.js';

import { RectAreaLight } from '../../../../src/lights/RectAreaLight.js';

import { Light } from '../../../../src/lights/Light.js';

describe( 'Lights', () => {

	describe( 'RectAreaLight', () => {

		let lights = undefined;
		beforeEach( function () {

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
		test( 'Extending', () => {

			const object = new RectAreaLight();
			assert.strictEqual(
				object instanceof Light, true,
				'RectAreaLight extends from Light'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new RectAreaLight();
			assert.ok( object, 'Can instantiate a RectAreaLight.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new RectAreaLight();
			assert.ok(
				object.type === 'RectAreaLight',
				'RectAreaLight.type should be RectAreaLight'
			);

		} );

		test( 'power', () => {

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
		test( 'isRectAreaLight', () => {

			const object = new RectAreaLight();
			assert.ok(
				object.isRectAreaLight,
				'RectAreaLight.isRectAreaLight should be true'
			);

		} );

		// OTHERS
		test( 'Standard light tests', () => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
