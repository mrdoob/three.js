import { beforeEach, describe, test } from 'vitest';

import { Light } from '../../../../src/lights/Light.js';

import { Object3D } from '../../../../src/core/Object3D.js';
import { assert, runStdLightTests } from '../../utils/test-utils.js';

describe( 'Lights', () => {

	describe( 'Light', () => {

		let lights = undefined;
		beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.5
			};

			lights = [
				new Light(),
				new Light( parameters.color ),
				new Light( parameters.color, parameters.intensity )
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Light();
			assert.strictEqual(
				object instanceof Object3D, true,
				'Light extends from Object3D'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Light();
			assert.ok( object, 'Can instantiate a Light.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new Light();
			assert.ok(
				object.type === 'Light',
				'Light.type should be Light'
			);

		} );

		// PUBLIC
		test( 'isLight', () => {

			const object = new Light();
			assert.ok(
				object.isLight,
				'Light.isLight should be true'
			);

		} );

		test( 'dispose', () => {


			// empty, test exists
			const object = new Light();
			object.dispose();

		} );

		// OTHERS
		test( 'Standard light tests', () => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
