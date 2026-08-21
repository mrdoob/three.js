import {
	float, vec2, vec3, mat2, mat3, mat4,
	dot, cross, length, distance, normalize,
	reflect, refract,
	transpose, inverse, mul
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Vector and mat3/mat4 coverage not already handled by TSLFaceForward.tests.js
// / TSLDeterminant.tests.js. Expected values are hand-derived from standard
// linear-algebra identities/formulas (not by re-running the node under
// test), so a broken implementation that merely agrees with itself can't
// pass -- see the "test theater" link in GPUTest.tests.js.
//
// mat2/mat3/mat4 assertions exercise gpu-test-utils.js's matrix support (see
// its file header for how a matrix value is threaded through the harness).
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'vector functions', () => {

		gpuTest( 'dot/cross/length/distance with hand-computed values', ( { assert } ) => {

			assert.closeAbs( dot( vec3( 1, 2, 3 ), vec3( 4, 5, 6 ) ), float( 32 ), 1e-5, 'dot([1,2,3],[4,5,6]) == 4+10+18 == 32' );
			assert.closeAbs( length( vec3( 3, 4, 0 ) ), float( 5 ), 1e-5, '3-4-5 triangle' );
			assert.closeAbs( distance( vec3( 0, 0, 0 ), vec3( 3, 4, 0 ) ), float( 5 ), 1e-5, 'distance mirrors the 3-4-5 triangle' );

			// cross(x-axis, y-axis) == z-axis, and must be orthogonal to both inputs.
			const x = vec3( 1, 0, 0 );
			const y = vec3( 0, 1, 0 );
			const c = cross( x, y );
			assert.closeAbs( c, vec3( 0, 0, 1 ), 1e-5, 'cross(+X, +Y) == +Z' );
			assert.closeAbs( dot( c, x ), float( 0 ), 1e-5, 'cross product is orthogonal to its first operand' );
			assert.closeAbs( dot( c, y ), float( 0 ), 1e-5, 'cross product is orthogonal to its second operand' );

		} );

		gpuTest( 'normalize() produces a unit vector pointing the same direction', ( { assert } ) => {

			assert.closeAbs( normalize( vec3( 5, 0, 0 ) ), vec3( 1, 0, 0 ), 1e-5, 'axis-aligned vector normalizes to the exact unit axis' );
			assert.closeAbs( length( normalize( vec3( 3, - 4, 12 ) ) ), float( 1 ), 1e-5, 'arbitrary vector normalizes to unit length' );

			// A very small (but non-zero) vector should still normalize to unit
			// length rather than collapsing to zero from underflow.
			assert.closeAbs( length( normalize( vec3( 1e-6, 0, 0 ) ) ), float( 1 ), 1e-3, 'a tiny nonzero vector still normalizes to unit length' );

		} );

		gpuTest( 'reflect() off an axis-aligned plane', ( { assert } ) => {

			// reflect(I, N) == I - 2*dot(N,I)*N. For a 45-degree incident ray
			// hitting a horizontal plane (normal +Y), the reflection is the
			// mirror image across that plane.
			const incident = vec3( 1, - 1, 0 );
			const normal = vec3( 0, 1, 0 );
			assert.closeAbs( reflect( incident, normal ), vec3( 1, 1, 0 ), 1e-5, 'reflect(1,-1,0 off +Y) == (1,1,0)' );

		} );

		gpuTest( 'refract() Snell\'s law, including total internal reflection', ( { assert } ) => {

			// Straight-on incidence (I parallel to -N) is never bent, regardless of eta.
			const straightOn = refract( vec3( 0, - 1, 0 ), vec3( 0, 1, 0 ), float( 0.9 ) );
			assert.closeAbs( straightOn, vec3( 0, - 1, 0 ), 1e-4, 'refract() straight through the normal is undeviated' );

			// Total internal reflection: going from a denser to a less-dense
			// medium (eta > 1) past the critical angle must return exactly
			// vec3(0) per the GLSL/WGSL spec, rather than a bent (and physically
			// meaningless) ray.
			const grazing = normalize( vec3( 0.99, - 0.1411, 0 ) ); // close to grazing incidence
			const tir = refract( grazing, vec3( 0, 1, 0 ), float( 1.5 ) );
			assert.closeAbs( tir, vec3( 0, 0, 0 ), 1e-5, 'refract() past the critical angle returns the zero vector (total internal reflection)' );

		} );

	} );

	QUnit.module( 'matrix functions (mat2/mat3/mat4)', () => {

		gpuTest( 'mat2: constructor, element access and mul(mat2, vec2) (first real exercise of gpu-test-utils.js mat2 support)', ( { assert } ) => {

			// mat2(4 scalars) is row-major, same convention as mat3(9 scalars)/
			// mat4(16 scalars) -- see the dedicated mat3 finding below.
			const m = mat2( 1, 2, 3, 4 );
			assert.eq( m.element( 0 ), vec2( 1, 3 ), 'column 0 == the first entry of each constructor row' );
			assert.eq( m.element( 1 ), vec2( 2, 4 ), 'column 1 == the second entry of each constructor row' );

			// A pure per-axis scale: m * (1,1) must be exactly (2,4).
			const scale = mat2( 2, 0, 0, 4 );
			assert.closeAbs( mul( scale, vec2( 1, 1 ) ), vec2( 2, 4 ), 1e-5, 'diagonal-scale mat2 times (1,1)' );

		} );

		gpuTest( 'mat3(a,b,c,...) 9-scalar constructor takes ROW-major arguments (like Matrix3.set(), NOT GLSL\'s own column-major literal convention)', ( { assert } ) => {

			// Verified empirically (see tsl-unit-test-findings.md): TSL's
			// ConvertType machinery routes a plain 9-number call like
			// mat3(1,2,3,4,5,6,7,8,9) through `getValueFromType('mat3', ...)`,
			// which builds a real THREE.Matrix3 via `.set(...)` -- and
			// Matrix3.set(n11,n12,n13, n21,n22,n23, n31,n32,n33) takes
			// ROW-major arguments (matching the rest of three.js's Matrix
			// API) while storing them column-major internally. The constant
			// is then re-emitted from that internal (column-major) array.
			// Net effect: mat3(1,2,3,4,5,6,7,8,9) constructs the matrix whose
			// ROWS (conventionally written) are (1,2,3), (4,5,6), (7,8,9) --
			// *not* a matrix whose GLSL-native columns are those triples, as
			// a literal, unqualified `mat3(9 floats)` would be in raw GLSL/
			// WGSL. element(i) still means "column i" of that (conventional)
			// matrix, so column 0 is (1,4,7): the first entry of every row.
			const m = mat3( 1, 2, 3, 4, 5, 6, 7, 8, 9 );
			assert.eq( m.element( 0 ), vec3( 1, 4, 7 ), 'column 0 == the first entry of each constructor row' );
			assert.eq( m.element( 1 ), vec3( 2, 5, 8 ), 'column 1 == the second entry of each constructor row' );
			assert.eq( m.element( 2 ), vec3( 3, 6, 9 ), 'column 2 == the third entry of each constructor row' );

		} );

		gpuTest( 'mat3 transpose of a known non-symmetric matrix', ( { assert } ) => {

			// m, written conventionally (see the row-major finding above), is:
			//   [ 1 2 3 ]
			//   [ 4 5 6 ]
			//   [ 7 8 9 ]
			// transpose(m)'s column i is m's row i -- hand-derived, independent
			// of whatever transpose() actually does internally.
			const m = mat3( 1, 2, 3, 4, 5, 6, 7, 8, 9 );

			assert.eq( transpose( m ).element( 0 ), vec3( 1, 2, 3 ), 'transpose column 0 == original row 0' );
			assert.eq( transpose( m ).element( 1 ), vec3( 4, 5, 6 ), 'transpose column 1 == original row 1' );
			assert.eq( transpose( m ).element( 2 ), vec3( 7, 8, 9 ), 'transpose column 2 == original row 2' );

		} );

		gpuTest( 'mat3 inverse of a diagonal scale matrix has reciprocal diagonal entries', ( { assert } ) => {

			const scale = mat3( 2, 0, 0, 0, 4, 0, 0, 0, 5 );
			const inv = inverse( scale );

			assert.closeAbs( inv.element( 0 ), vec3( 0.5, 0, 0 ), 1e-5, 'inverse diagonal reciprocal: 1/2' );
			assert.closeAbs( inv.element( 1 ), vec3( 0, 0.25, 0 ), 1e-5, 'inverse diagonal reciprocal: 1/4' );
			assert.closeAbs( inv.element( 2 ), vec3( 0, 0, 0.2 ), 1e-5, 'inverse diagonal reciprocal: 1/5' );

		} );

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

		gpuTest( 'mat3 * vec3 transforms a vector using known column data', ( { assert } ) => {

			// m's columns are (1,0,0), (0,2,0), (0,0,3) -- a pure per-axis scale --
			// so m * (1,1,1) must be exactly (1,2,3), derived directly from the
			// scale factors rather than from the matrix-multiply code being tested.
			const m = mat3( 1, 0, 0, 0, 2, 0, 0, 0, 3 );
			assert.closeAbs( mul( m, vec3( 1, 1, 1 ) ), vec3( 1, 2, 3 ), 1e-5, 'diagonal-scale matrix times (1,1,1)' );

		} );

		gpuTest( 'mat3(vec3, vec3, vec3) is COLUMN-major (GLSL-native), the OPPOSITE convention from mat3(9 scalars) (row-major, see above)', ( { assert } ) => {

			// A real, confirmed sharp edge in this codebase's TSL surface: the
			// two mat3 constructor call shapes take OPPOSITE argument
			// conventions. `mat3(9 plain numbers)` routes through
			// `getValueFromType()` -> `new Matrix3().set(...)`, which is
			// ROW-major (see the dedicated test above). But `mat3(vec3, vec3,
			// vec3)` -- three *Node* arguments, not plain numbers -- takes a
			// completely different code path (`ConvertType` sees `object`-typed
			// params and skips `getValueFromType()` entirely, building a
			// `JoinNode` instead), and `JoinNode.generate()` just emits a
			// literal `mat3(a, b, c)` in the generated GLSL/WGSL -- which is
			// GLSL/WGSL's own native, COLUMN-major constructor: each vec3
			// argument becomes one COLUMN, not one row. This is exactly the
			// pattern used throughout src/nodes/display/ToneMappingFunctions.js
			// and MaterialXNoise.js's various matrix constants -- correct
			// there (those matrices are written with the intent of literal
			// GLSL column-major semantics), but a real trap for anyone
			// assuming mat3's *scalar* constructor's row-major convention
			// (documented above, and it's the one Matrix3-familiar readers of
			// this codebase would reasonably expect) also applies here.
			const m = mat3( vec3( 1, 2, 3 ), vec3( 4, 5, 6 ), vec3( 7, 8, 9 ) );

			assert.eq( m.element( 0 ), vec3( 1, 2, 3 ), 'column 0 == the first vec3 argument, verbatim (not its first component spread across a row)' );
			assert.eq( m.element( 1 ), vec3( 4, 5, 6 ), 'column 1 == the second vec3 argument, verbatim' );
			assert.eq( m.element( 2 ), vec3( 7, 8, 9 ), 'column 2 == the third vec3 argument, verbatim' );

			// Contrast directly against the scalar-constructor form using the
			// exact same 9 numbers, flattened in the same reading order --
			// the two are each other's transpose.
			const mScalars = mat3( 1, 2, 3, 4, 5, 6, 7, 8, 9 );
			assert.eq( transpose( m ), mScalars, 'mat3(vec3,vec3,vec3) with these columns is the transpose of mat3(...9 scalars) with the same numbers in reading order' );

		} );

		gpuTest( 'mul(mat3, vec3) is a standard M*v product (v as a column vector) against the mat3(vec3,vec3,vec3) column-major layout above', ( { assert } ) => {

			// m's first column (verbatim, per the finding above) is (1,2,3), so
			// m * (1,0,0) -- v as a column vector -- must select exactly that
			// column back out: (1,2,3), not (1,4,7) (which is what the *other*
			// valid multiplication convention, v^T * M, would give here instead).
			const m = mat3( vec3( 1, 2, 3 ), vec3( 4, 5, 6 ), vec3( 7, 8, 9 ) );
			assert.eq( mul( m, vec3( 1, 0, 0 ) ), vec3( 1, 2, 3 ), 'mul(m, (1,0,0)) selects column 0 verbatim -- confirms the M*v convention' );

		} );

	} );

} );
