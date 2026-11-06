import { assert, describe, test } from 'vitest';

import { SpotLightHelper } from '../../../../src/helpers/SpotLightHelper.js';

import { Object3D } from '../../../../src/core/Object3D.js';
import { SpotLight } from '../../../../src/lights/SpotLight.js';

describe( 'Helpers', () => {

	describe( 'SpotLightHelper', () => {

		const parameters = {
			color: 0xaaaaaa,
			intensity: 0.5,
			distance: 100,
			angle: 0.8,
			penumbra: 8,
			decay: 2
		};

		// INHERITANCE
		test( 'Extending', () => {

			const light = new SpotLight( parameters.color );
			const object = new SpotLightHelper( light, parameters.color );
			assert.strictEqual(
				object instanceof Object3D, true,
				'SpotLightHelper extends from Object3D'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const light = new SpotLight( parameters.color );
			const object = new SpotLightHelper( light, parameters.color );
			assert.ok( object, 'Can instantiate a SpotLightHelper.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const light = new SpotLight( parameters.color );
			const object = new SpotLightHelper( light, parameters.color );
			assert.ok(
				object.type === 'SpotLightHelper',
				'SpotLightHelper.type should be SpotLightHelper'
			);

		} );

		// PUBLIC
		test( 'dispose', () => {


			const light = new SpotLight( parameters.color );
			const object = new SpotLightHelper( light, parameters.color );
			object.dispose();

		} );

	} );

} );
