import {
	mat4, inverse, mul
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'TempNode branch caching', () => {

		gpuTest( 'mat4 M * inverse(M) recovers the identity for a non-trivial matrix', ( { assert } ) => {

			// A general invertible affine matrix (rotation-free shear + translation
			// in the last column) -- checking M * inverse(M) == I is a real,
			// meaningful numerical round trip (not tautological: a broken
			// inverse() or a broken mul() would each independently break this).
			const m = mat4(
				1, 0, 0, 0,
				0.5, 1, 0, 0,
				0, 0.25, 1, 0,
				3, - 2, 1, 1
			);

			const identity = mat4( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 );
			const product = mul( m, inverse( m ) );

			assert.closeAbs( product, identity, 1e-4, 'M * inverse(M) == I' );

		} );

	} );

} );
