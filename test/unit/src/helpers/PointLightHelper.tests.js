import { assert, describe, test } from 'vitest';

import { PointLightHelper } from '../../../../src/helpers/PointLightHelper.js';

import { Mesh } from '../../../../src/objects/Mesh.js';
import { PointLight } from '../../../../src/lights/PointLight.js';

describe( 'Helpers', () => {

	describe( 'PointLightHelper', () => {

		const parameters = {
			sphereSize: 1,
			color: 0xaaaaaa,
			intensity: 0.5,
			distance: 100,
			decay: 2
		};

		// INHERITANCE
		test( 'Extending', () => {

			const light = new PointLight( parameters.color );
			const object = new PointLightHelper( light, parameters.sphereSize, parameters.color );
			assert.strictEqual(
				object instanceof Mesh, true,
				'PointLightHelper extends from Mesh'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const light = new PointLight( parameters.color );
			const object = new PointLightHelper( light, parameters.sphereSize, parameters.color );
			assert.ok( object, 'Can instantiate a PointLightHelper.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const light = new PointLight( parameters.color );
			const object = new PointLightHelper( light, parameters.sphereSize, parameters.color );
			assert.ok(
				object.type === 'PointLightHelper',
				'PointLightHelper.type should be PointLightHelper'
			);

		} );

		// PUBLIC
		test( 'dispose', () => {


			const light = new PointLight( parameters.color );
			const object = new PointLightHelper( light, parameters.sphereSize, parameters.color );
			object.dispose();

		} );

	} );

} );
