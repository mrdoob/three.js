import { assert, describe, test } from 'vitest';

import { HemisphereLightHelper } from '../../../../src/helpers/HemisphereLightHelper.js';

import { Object3D } from '../../../../src/core/Object3D.js';
import { HemisphereLight } from '../../../../src/lights/HemisphereLight.js';

describe( 'Helpers', () => {

	describe( 'HemisphereLightHelper', () => {

		const parameters = {
			size: 1,
			color: 0xabc012,
			skyColor: 0x123456,
			groundColor: 0xabc012,
			intensity: 0.6
		};

		// INHERITANCE
		test( 'Extending', () => {

			const light = new HemisphereLight( parameters.skyColor );
			const object = new HemisphereLightHelper( light, parameters.size, parameters.color );
			assert.strictEqual(
				object instanceof Object3D, true,
				'HemisphereLightHelper extends from Object3D'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const light = new HemisphereLight( parameters.skyColor );
			const object = new HemisphereLightHelper( light, parameters.size, parameters.color );
			assert.ok( object, 'Can instantiate a HemisphereLightHelper.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const light = new HemisphereLight( parameters.skyColor );
			const object = new HemisphereLightHelper( light, parameters.size, parameters.color );
			assert.ok(
				object.type === 'HemisphereLightHelper',
				'HemisphereLightHelper.type should be HemisphereLightHelper'
			);

		} );

		// PUBLIC
		test( 'dispose', () => {


			const light = new HemisphereLight( parameters.skyColor );
			const object = new HemisphereLightHelper( light, parameters.size, parameters.color );
			object.dispose();

		} );

	} );

} );
