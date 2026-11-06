import { assert, describe, test } from 'vitest';

import { FBXLoader } from '../../../../examples/jsm/loaders/FBXLoader.js';

describe( 'Addons', () => {

	describe( 'Loaders', () => {

		describe( 'FBXLoader', () => {

			test( 'morphAttributes length match geometry position length', async () => {

				const fbx = await new FBXLoader().loadAsync( '/examples/models/fbx/morph_test.fbx' );
				const mesh = fbx.children[ 0 ];
				assert.strictEqual( mesh.geometry.morphAttributes.position[ 0 ].count, mesh.geometry.attributes.position.count );

			} );

		} );

	} );

} );
