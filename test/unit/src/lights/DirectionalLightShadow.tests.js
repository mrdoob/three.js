import { describe, test } from 'vitest';
import { assert } from '../../utils/test-utils.js';

import { DirectionalLightShadow } from '../../../../src/lights/DirectionalLightShadow.js';

import { LightShadow } from '../../../../src/lights/LightShadow.js';
import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';
import { DirectionalLight } from '../../../../src/lights/DirectionalLight.js';

describe( 'Lights', () => {

	describe( 'DirectionalLightShadow', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new DirectionalLightShadow();
			assert.strictEqual(
				object instanceof LightShadow, true,
				'DirectionalLightShadow extends from LightShadow'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new DirectionalLightShadow();
			assert.ok( object, 'Can instantiate a DirectionalLightShadow.' );

		} );

		// PUBLIC
		test( 'isDirectionalLightShadow', () => {

			const object = new DirectionalLightShadow();
			assert.ok(
				object.isDirectionalLightShadow,
				'DirectionalLightShadow.isDirectionalLightShadow should be true'
			);

		} );

		// OTHERS
		test( 'clone/copy', () => {

			const a = new DirectionalLightShadow();
			const b = new DirectionalLightShadow();

			assert.notDeepEqual( a, b, 'Newly instanced shadows are not equal' );

			const c = a.clone();
			assert.smartEqual( a, c, 'Shadows are identical after clone()' );

			c.mapSize.set( 1024, 1024 );
			assert.notDeepEqual( a, c, 'Shadows are different again after change' );

			b.copy( a );
			assert.smartEqual( a, b, 'Shadows are identical after copy()' );

			b.mapSize.set( 512, 512 );
			assert.notDeepEqual( a, b, 'Shadows are different again after change' );

		} );

		test( 'toJSON', () => {

			const light = new DirectionalLight();
			const shadow = new DirectionalLightShadow();

			shadow.bias = 10;
			shadow.radius = 5;
			shadow.mapSize.set( 1024, 1024 );
			light.shadow = shadow;

			const json = light.toJSON();
			const newLight = new ObjectLoader().parse( json );

			assert.smartEqual(
				newLight.shadow, light.shadow,
				'Reloaded shadow is identical to the original one'
			);

		} );

	} );

} );
