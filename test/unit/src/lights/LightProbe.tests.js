import { assert, describe, test } from 'vitest';

import { LightProbe } from '../../../../src/lights/LightProbe.js';

import { Light } from '../../../../src/lights/Light.js';

describe( 'Lights', () => {

	describe( 'LightProbe', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new LightProbe();
			assert.strictEqual(
				object instanceof Light, true,
				'LightProbe extends from Light'
			);

		} );

		// PUBLIC
		test( 'isLightProbe', () => {

			const object = new LightProbe();
			assert.ok(
				object.isLightProbe,
				'LightProbe.isLightProbe should be true'
			);

		} );

	} );

} );
