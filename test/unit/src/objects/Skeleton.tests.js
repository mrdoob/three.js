import { assert, describe, test } from 'vitest';

import { Skeleton } from '../../../../src/objects/Skeleton.js';

describe( 'Objects', () => {

	describe( 'Skeleton', () => {

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Skeleton();
			assert.ok( object, 'Can instantiate a Skeleton.' );

		} );

		// PUBLIC

		test( 'dispose', () => {


			const object = new Skeleton();
			object.dispose();

		} );

	} );

} );
