import { assert, describe, test } from 'vitest';

import { DirectionalLightHelper } from '../../../../src/helpers/DirectionalLightHelper.js';

import { Object3D } from '../../../../src/core/Object3D.js';
import { DirectionalLight } from '../../../../src/lights/DirectionalLight.js';

describe( 'Helpers', () => {

	describe( 'DirectionalLightHelper', () => {

		const parameters = {
			size: 1,
			color: 0xaaaaaa,
			intensity: 0.8
		};

		// INHERITANCE
		test( 'Extending', () => {

			const light = new DirectionalLight( parameters.color );
			const object = new DirectionalLightHelper( light, parameters.size, parameters.color );
			assert.strictEqual(
				object instanceof Object3D, true,
				'DirectionalLightHelper extends from Object3D'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const light = new DirectionalLight( parameters.color );
			const object = new DirectionalLightHelper( light, parameters.size, parameters.color );
			assert.ok( object, 'Can instantiate a DirectionalLightHelper.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const light = new DirectionalLight( parameters.color );
			const object = new DirectionalLightHelper( light, parameters.size, parameters.color );
			assert.ok(
				object.type === 'DirectionalLightHelper',
				'DirectionalLightHelper.type should be DirectionalLightHelper'
			);

		} );

		// PUBLIC
		test( 'dispose', () => {


			const light = new DirectionalLight( parameters.color );
			const object = new DirectionalLightHelper( light, parameters.size, parameters.color );
			object.dispose();

		} );

	} );

} );
