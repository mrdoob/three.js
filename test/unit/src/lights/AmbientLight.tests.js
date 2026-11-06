import { beforeEach, describe, test } from 'vitest';

import { AmbientLight } from '../../../../src/lights/AmbientLight.js';

import { Light } from '../../../../src/lights/Light.js';
import { assert, runStdLightTests } from '../../utils/test-utils.js';

describe( 'Lights', () => {

	describe( 'AmbientLight', () => {

		let lights = undefined;
		beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.5
			};

			lights = [
				new AmbientLight(),
				new AmbientLight( parameters.color ),
				new AmbientLight( parameters.color, parameters.intensity )
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new AmbientLight();
			assert.strictEqual(
				object instanceof Light, true,
				'AmbientLight extends from Light'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new AmbientLight();
			assert.ok( object, 'Can instantiate an AmbientLight.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new AmbientLight();
			assert.ok(
				object.type === 'AmbientLight',
				'AmbientLight.type should be AmbientLight'
			);

		} );

		// PUBLIC
		test( 'isAmbientLight', () => {

			const object = new AmbientLight();
			assert.ok(
				object.isAmbientLight,
				'AmbientLight.isAmbientLight should be true'
			);

		} );

		// OTHERS
		test( 'Standard light tests', () => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
