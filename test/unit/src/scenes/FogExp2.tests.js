import { assert, describe, test } from 'vitest';

import { FogExp2 } from '../../../../src/scenes/FogExp2.js';

describe( 'Scenes', () => {

	describe( 'FoxExp2', () => {

		// INSTANCING
		test( 'Instancing', () => {

			// FoxExp2( color, density = 0.00025 )

			// no params
			const object = new FogExp2();
			assert.ok( object, 'Can instantiate a FogExp2.' );

			// color
			const object_color = new FogExp2( 0xffffff );
			assert.ok( object_color, 'Can instantiate a FogExp2 with color.' );

			// color, density
			const object_all = new FogExp2( 0xffffff, 0.00030 );
			assert.ok( object_all, 'Can instantiate a FogExp2 with color, density.' );

		} );

		// PUBLIC STUFF
		test( 'isFogExp2', () => {

			const object = new FogExp2();
			assert.ok(
				object.isFogExp2,
				'FogExp2.isFogExp2 should be true'
			);

		} );

	} );

} );
