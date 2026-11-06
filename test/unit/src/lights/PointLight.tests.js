import { beforeEach, describe, test } from 'vitest';
import { assert, runStdLightTests } from '../../utils/test-utils.js';

import { PointLight } from '../../../../src/lights/PointLight.js';

import { Light } from '../../../../src/lights/Light.js';

describe( 'Lights', () => {

	describe( 'PointLight', () => {

		let lights = undefined;
		beforeEach( function () {

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
		test( 'Extending', () => {

			const object = new PointLight();
			assert.strictEqual(
				object instanceof Light, true,
				'PointLight extends from Light'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new PointLight();
			assert.ok( object, 'Can instantiate a PointLight.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new PointLight();
			assert.ok(
				object.type === 'PointLight',
				'PointLight.type should be PointLight'
			);

		} );

		test( 'power', () => {

			const a = new PointLight( 0xaaaaaa );

			a.intensity = 100;
			assert.numEqual( a.power, 100 * Math.PI * 4, 'Correct power for an intensity of 100' );

			a.intensity = 40;
			assert.numEqual( a.power, 40 * Math.PI * 4, 'Correct power for an intensity of 40' );

			a.power = 100;
			assert.numEqual( a.intensity, 100 / ( 4 * Math.PI ), 'Correct intensity for a power of 100' );

		} );

		// PUBLIC
		test( 'isPointLight', () => {

			const object = new PointLight();
			assert.ok(
				object.isPointLight,
				'PointLight.isPointLight should be true'
			);

		} );

		test( 'dispose', () => {


			const object = new PointLight();
			object.dispose();

			// ensure calls dispose() on shadow

		} );

		// OTHERS
		test( 'Standard light tests', () => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
