import { assert, describe, test } from 'vitest';

import { PointLightShadow } from '../../../../src/lights/PointLightShadow.js';

import { LightShadow } from '../../../../src/lights/LightShadow.js';

describe( 'Lights', () => {

	describe( 'PointLightShadow', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new PointLightShadow();
			assert.strictEqual(
				object instanceof LightShadow, true,
				'PointLightShadow extends from LightShadow'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new PointLightShadow();
			assert.ok( object, 'Can instantiate a PointLightShadow.' );

		} );

		// PUBLIC
		test( 'isPointLightShadow', () => {

			const object = new PointLightShadow();
			assert.ok(
				object.isPointLightShadow,
				'PointLightShadow.isPointLightShadow should be true'
			);

		} );

	} );

} );
