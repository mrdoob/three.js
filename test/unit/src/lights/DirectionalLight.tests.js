import { beforeEach, describe, test } from 'vitest';

import { DirectionalLight } from '../../../../src/lights/DirectionalLight.js';

import { Light } from '../../../../src/lights/Light.js';
import { assert, runStdLightTests } from '../../utils/test-utils.js';

describe( 'Lights', () => {

	describe( 'DirectionalLight', () => {

		let lights = undefined;
		beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.8
			};

			lights = [
				new DirectionalLight(),
				new DirectionalLight( parameters.color ),
				new DirectionalLight( parameters.color, parameters.intensity )
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new DirectionalLight();
			assert.strictEqual(
				object instanceof Light, true,
				'DirectionalLight extends from Light'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new DirectionalLight();
			assert.ok( object, 'Can instantiate a DirectionalLight.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new DirectionalLight();
			assert.ok(
				object.type === 'DirectionalLight',
				'DirectionalLight.type should be DirectionalLight'
			);

		} );

		// PUBLIC
		test( 'isDirectionalLight', () => {

			const object = new DirectionalLight();
			assert.ok(
				object.isDirectionalLight,
				'DirectionalLight.isDirectionalLight should be true'
			);

		} );

		test( 'dispose', () => {


			const object = new DirectionalLight();
			object.dispose();

			// ensure calls dispose() on shadow

		} );

		// OTHERS
		test( 'Standard light tests', () => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
