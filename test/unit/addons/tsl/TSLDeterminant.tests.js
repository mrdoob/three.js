import {
	float, mat3, mat4, determinant
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'determinant()', () => {

		gpuTest( 'determinant() of identity matrices is 1', ( { assert } ) => {

			const I3 = mat3( 1, 0, 0, 0, 1, 0, 0, 0, 1 );
			assert.closeAbs( determinant( I3 ), float( 1 ), 1e-5, 'determinant(I3) == 1' );

			const I4 = mat4( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 );
			assert.closeAbs( determinant( I4 ), float( 1 ), 1e-5, 'determinant(I4) == 1' );

		} );

		gpuTest( 'mat3 determinant of a diagonal scale matrix', ( { assert } ) => {

			// determinant of a diagonal matrix is just the product of its
			// diagonal entries -- 2 * 3 * 4 == 24, independent of the general
			// cofactor-expansion implementation under test.
			const scale = mat3( 2, 0, 0, 0, 3, 0, 0, 0, 4 );
			assert.closeAbs( determinant( scale ), float( 24 ), 1e-4, 'determinant(diag(2,3,4)) == 24' );

		} );

	} );

} );
