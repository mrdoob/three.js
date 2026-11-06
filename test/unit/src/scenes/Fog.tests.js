import { assert, describe, test } from 'vitest';

import { Fog } from '../../../../src/scenes/Fog.js';

describe( 'Scenes', () => {

	describe( 'Fog', () => {

		// INSTANCING
		test( 'Instancing', () => {

			// Fog( color, near = 1, far = 1000 )

			// no params
			const object = new Fog();
			assert.ok( object, 'Can instantiate a Fog.' );

			// color
			const object_color = new Fog( 0xffffff );
			assert.ok( object_color, 'Can instantiate a Fog with color.' );

			// color, near, far
			const object_all = new Fog( 0xffffff, 0.015, 100 );
			assert.ok( object_all, 'Can instantiate a Fog with color, near, far.' );

		} );

		// PUBLIC
		test( 'isFog', () => {

			const object = new Fog();
			assert.ok(
				object.isFog,
				'Fog.isFog should be true'
			);

		} );

	} );

} );
