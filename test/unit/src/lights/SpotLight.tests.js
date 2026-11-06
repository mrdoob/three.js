import { beforeEach, describe, test } from 'vitest';
import { assert, runStdLightTests } from '../../utils/test-utils.js';

import { SpotLight } from '../../../../src/lights/SpotLight.js';

import { Light } from '../../../../src/lights/Light.js';

describe( 'Lights', () => {

	describe( 'SpotLight', () => {

		let lights = undefined;
		beforeEach( function () {

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
		test( 'Extending', () => {

			const object = new SpotLight();
			assert.strictEqual(
				object instanceof Light, true,
				'SpotLight extends from Light'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new SpotLight();
			assert.ok( object, 'Can instantiate a SpotLight.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new SpotLight();
			assert.ok(
				object.type === 'SpotLight',
				'SpotLight.type should be SpotLight'
			);

		} );

		test( 'power', () => {

			const a = new SpotLight( 0xaaaaaa );

			a.intensity = 100;
			assert.numEqual( a.power, 100 * Math.PI, 'Correct power for an intensity of 100' );

			a.intensity = 40;
			assert.numEqual( a.power, 40 * Math.PI, 'Correct power for an intensity of 40' );

			a.power = 100;
			assert.numEqual( a.intensity, 100 / Math.PI, 'Correct intensity for a power of 100' );

		} );

		// PUBLIC
		test( 'isSpotLight', () => {

			const object = new SpotLight();
			assert.ok(
				object.isSpotLight,
				'SpotLight.isSpotLight should be true'
			);

		} );

		test( 'dispose', () => {


			const object = new SpotLight();
			object.dispose();

			// ensure calls dispose() on shadow

		} );

		// OTHERS
		test( 'Standard light tests', () => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
