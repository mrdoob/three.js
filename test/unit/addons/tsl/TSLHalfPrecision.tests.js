import { float, half, hvec2, hvec3, hvec4, hmat2, hmat3, hmat4, mul } from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Half-precision (fp16) types are explicit-opt-in: `half`/`hvec2/3/4`/`hmat2/3/4`.
//
// On WebGPU with the `shader-f16` GPU feature, these compile down to real WGSL `f16` /
// `vec2h`/`vec3h`/`vec4h`/`mat2x2h`/`mat3x3h`/`mat4x4h` types. Everywhere else -- WebGL, or
// WebGPU without the feature -- they transparently alias to their fp32 equivalent, so the
// *same* TSL code is expected to produce numerically equivalent results on every backend.
// That equivalence is exactly what these tests assert: they never special-case a backend or
// feature flag, they just check that half-typed math gives the (fp32-accurate, since these
// values all round-trip losslessly through fp16) expected results everywhere.
//
// gpu-test-utils' AssertWriteNode requires both sides of an assertion to resolve to the exact
// same TSL type (see gpu-test-utils.js's `setup()`), so every comparison below is half-vs-half
// or (after an explicit `.toFloat()`/`float()` conversion) float-vs-float -- never a bare
// half-vs-float mix, which would throw at build time rather than testing anything meaningful.
//
// hmat2/hmat3/hmat4 are readable here because gpu-test-utils' `resolveLayout()` promotes an
// `hmat*` type to its `mat*` column layout (columns/columnLength are identical -- only the
// component precision differs, and every column is cast back to float on readback regardless).
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'half precision (fp16)', () => {

		gpuTest( 'half scalar arithmetic', ( { assert } ) => {

			assert.closeAbs( half( 1.5 ).add( half( 2.5 ) ), half( 4.0 ), 1e-3, 'half(1.5) + half(2.5)' );
			assert.closeAbs( half( 3.0 ).mul( half( 2.0 ) ), half( 6.0 ), 1e-3, 'half(3.0) * half(2.0)' );
			assert.closeAbs( half( 1.0 ).div( half( 4.0 ) ), half( 0.25 ), 1e-4, 'half(1.0) / half(4.0)' );

		} );

		gpuTest( 'half <-> float conversion round-trips', ( { assert } ) => {

			// 3.25 is exactly representable in fp16 (it's not just "close enough").
			assert.closeAbs( half( 3.25 ).toFloat(), float( 3.25 ), 1e-3, 'half(3.25).toFloat()' );
			assert.closeAbs( float( 3.25 ).toHalf().toFloat(), float( 3.25 ), 1e-3, 'float(3.25).toHalf().toFloat()' );

		} );

		gpuTest( 'hvec2/hvec3/hvec4 arithmetic', ( { assert } ) => {

			assert.closeAbs( hvec2( 1, 2 ).add( hvec2( 0.5, 0.5 ) ), hvec2( 1.5, 2.5 ), 1e-3, 'hvec2 add' );
			assert.closeAbs( hvec3( 1, 2, 3 ).add( hvec3( 0.5, 0.5, 0.5 ) ), hvec3( 1.5, 2.5, 3.5 ), 1e-3, 'hvec3 add' );
			assert.closeAbs( hvec4( 1, 2, 3, 4 ).mul( hvec4( 2, 2, 2, 2 ) ), hvec4( 2, 4, 6, 8 ), 1e-3, 'hvec4 mul' );

		} );

		gpuTest( 'hvec3 swizzling stays half-typed', ( { assert } ) => {

			// Regression check for NodeBuilder.getComponentType()/getElementType(): swizzling
			// a half vector must produce another half type (hvec2), not silently promote to
			// fp32 (vec2) or fail to resolve a component type at all.
			assert.closeAbs( hvec3( 1, 2, 3 ).xy, hvec2( 1, 2 ), 1e-3, 'hvec3(1,2,3).xy == hvec2(1,2)' );

		} );

		gpuTest( 'hmat2/hmat3/hmat4: constructor, element access and mul() (exercises gpu-test-utils.js half-matrix promotion)', ( { assert } ) => {

			// hmat2/hmat3/hmat4(N scalars) is row-major, same convention as mat2/mat3/mat4's
			// scalar constructor (see TSLVectorMatrix.tests.js's dedicated mat3 finding).
			const m2 = hmat2( 1, 2, 3, 4 );
			assert.eq( m2.element( 0 ), hvec2( 1, 3 ), 'hmat2 column 0 == the first entry of each constructor row' );
			assert.eq( m2.element( 1 ), hvec2( 2, 4 ), 'hmat2 column 1 == the second entry of each constructor row' );

			const m3 = hmat3( 1, 0, 0, 0, 1, 0, 0, 0, 1 );
			assert.eq( m3.element( 0 ), hvec3( 1, 0, 0 ), 'hmat3 identity column 0' );

			const m4 = hmat4( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 );
			assert.eq( m4.element( 3 ), hvec4( 0, 0, 0, 1 ), 'hmat4 identity column 3' );

			// A pure per-axis scale: m * (1,1) must be exactly (2,4).
			const scale2 = hmat2( 2, 0, 0, 4 );
			assert.closeAbs( mul( scale2, hvec2( 1, 1 ) ), hvec2( 2, 4 ), 1e-3, 'diagonal-scale hmat2 times (1,1)' );

		} );

	} );

} );
