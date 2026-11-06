import { beforeEach, describe, test } from 'vitest';

import { HemisphereLight } from '../../../../src/lights/HemisphereLight.js';

import { Light } from '../../../../src/lights/Light.js';
import { assert, runStdLightTests } from '../../utils/test-utils.js';

describe( 'Lights', () => {

	describe( 'HemisphereLight', () => {

		let lights = undefined;
		beforeEach( function () {

			const parameters = {
				skyColor: 0x123456,
				groundColor: 0xabc012,
				intensity: 0.6
			};

			lights = [
				new HemisphereLight(),
				new HemisphereLight( parameters.skyColor ),
				new HemisphereLight( parameters.skyColor, parameters.groundColor ),
				new HemisphereLight( parameters.skyColor, parameters.groundColor, parameters.intensity ),
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new HemisphereLight();
			assert.strictEqual(
				object instanceof Light, true,
				'HemisphereLight extends from Light'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new HemisphereLight();
			assert.ok( object, 'Can instantiate a HemisphereLight.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new HemisphereLight();
			assert.ok(
				object.type === 'HemisphereLight',
				'HemisphereLight.type should be HemisphereLight'
			);

		} );

		// PUBLIC
		test( 'isHemisphereLight', () => {

			const object = new HemisphereLight();
			assert.ok(
				object.isHemisphereLight,
				'HemisphereLight.isHemisphereLight should be true'
			);

		} );

		// OTHERS
		test( 'Standard light tests', () => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
