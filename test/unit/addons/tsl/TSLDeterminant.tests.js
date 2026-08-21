import {
	float, mat3, mat4, determinant
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Regression coverage for a determinant() type-inference bug:
// determinant(m) genuinely computes and codegens a scalar (float) at the
// shader level, but MathNode.DETERMINANT was missing from the list of
// methods special-cased to report 'float' from generateNodeType(). It fell
// through to getInputType(), which for a single-matrix-argument call returns
// the *matrix's own type* (e.g. 'mat3') -- so determinant(mat3).getNodeType()
// answered 'mat3', not 'float': correct shader code, wrong type metadata.
// Any downstream TSL composition relying on automatic type inference for a
// determinant() result (comparisons, swizzles, or -- as here -- a test
// harness deciding how to store/compare the value) would get incorrect
// behavior purely from the type-metadata bug, independent of the arithmetic
// being right.
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
