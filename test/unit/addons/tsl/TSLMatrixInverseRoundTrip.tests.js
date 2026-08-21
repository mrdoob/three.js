import {
	mat4, inverse, mul
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Regression coverage for a general TSL codegen bug in TempNode.build()'s
// cached fast path (src/nodes/core/TempNode.js): a node promoted to a cached
// temp variable (anything deriving from TempNode -- most MathNode/
// OperatorNode-backed functions, including mul, inverse, arithmetic ops,
// etc.) got its assignment statement flowed into whichever code-block was
// active the *first* time it was referenced. If a *later* reference came
// from a sibling conditional block (an If/Else that doesn't share an
// ancestor with the first reference's block), that sibling's control-flow
// path never actually executed the assignment -- so the "cached" variable
// silently read its default-initialized value (0) there, with no compile
// error and no runtime warning.
//
// This test's harness (gpu-test-utils.js's gpuTest/assert.closeAbs on a
// mat4 value) writes each matrix column from its own If branch, all
// referencing the same shared `product` expression -- exactly the pattern
// that exposes the bug. Before the fix, this failed with only the diagonal
// entries correct (the column that happened to build first) and the rest
// silently zero.
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
