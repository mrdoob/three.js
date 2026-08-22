import { DataTexture, DataUtils, HalfFloatType, Matrix4, NearestFilter, RGBAFormat, Vector2, Vector3, Vector4 } from 'three';
import { float, half, hvec2, hvec3, hvec4, hmat2, hmat3, hmat4, instancedArray, mul, texture, uniform, vec2 } from 'three/tsl';
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

	// Half-precision uniforms (`uniform(value, 'half'|'hvec2'|'hvec3'|'hvec4')`). On WebGPU
	// with `shader-f16` available, these get a real bit-packed fp16 CPU-side representation
	// (see Uniform.js's HalfUniform/HVec2/3/4Uniform classes and
	// UniformsGroup.updateHalf/HVec2/3/4()); everywhere else they're plain fp32 uniforms under
	// the hood (see NodeBuilder.getNodeUniform()). Both backends are expected to round-trip the
	// same input value correctly regardless of which representation is actually used.
	QUnit.module( 'half precision (fp16) uniforms', () => {

		gpuTest( 'half/hvec2/hvec3/hvec4 uniforms round-trip their JS-side value', ( { assert } ) => {

			assert.closeAbs( uniform( 1.5, 'half' ), half( 1.5 ), 1e-3, 'half uniform' );
			assert.closeAbs( uniform( new Vector2( 1, 2 ), 'hvec2' ), hvec2( 1, 2 ), 1e-3, 'hvec2 uniform' );
			assert.closeAbs( uniform( new Vector3( 1, 2, 3 ), 'hvec3' ), hvec3( 1, 2, 3 ), 1e-3, 'hvec3 uniform' );
			assert.closeAbs( uniform( new Vector4( 1, 2, 3, 4 ), 'hvec4' ), hvec4( 1, 2, 3, 4 ), 1e-3, 'hvec4 uniform' );

		} );

		gpuTest( 'half uniform participates in half-typed math, then narrows back to float', ( { assert } ) => {

			const uHalf = uniform( 2.5, 'half' );
			assert.closeAbs( uHalf.add( half( 1.5 ) ).toFloat(), float( 4.0 ), 1e-3, 'half uniform + half literal, narrowed to float' );

		} );

	} );

	// Sampling an fp16-*storage* texture (`HalfFloatType`) already existed before this file --
	// see WGSLNodeBuilder.getComponentTypeFromTexture()/getUniforms(), which always declares
	// the WGSL sampled-texture type as `texture_2d<f32>` regardless of the underlying storage
	// format (WGSL's `textureSample()` always returns `vec4<f32>` -- there is no `f16` sampled
	// texture type). So "fp16 texture support" doesn't need a new sampled type: the storage
	// bandwidth win is already banked by `HalfFloatType`, and narrowing the fetched fp32 vec4
	// down to `hvec4` in-shader (if half-precision math is wanted downstream) already works via
	// the same generic `ConvertNode`/`format()` machinery `.toHVec4()` uses everywhere else.
	// This test exists to lock that existing path down, not to add anything new to it.
	QUnit.module( 'half precision (fp16) textures', () => {

		gpuTest( 'HalfFloatType texture is sampled as fp32 then narrows to hvec4', ( { assert } ) => {

			const data = new Uint16Array( 4 );
			data[ 0 ] = DataUtils.toHalfFloat( 0.25 );
			data[ 1 ] = DataUtils.toHalfFloat( 0.5 );
			data[ 2 ] = DataUtils.toHalfFloat( 0.75 );
			data[ 3 ] = DataUtils.toHalfFloat( 1.0 );

			const tex = new DataTexture( data, 1, 1, RGBAFormat, HalfFloatType );
			tex.minFilter = NearestFilter;
			tex.magFilter = NearestFilter;
			tex.generateMipmaps = false;
			tex.needsUpdate = true;

			const sampled = texture( tex, vec2( 0, 0 ) ).toHVec4();
			assert.closeAbs( sampled, hvec4( 0.25, 0.5, 0.75, 1.0 ), 1e-3, 'HalfFloatType RGBA texture sampled and narrowed to hvec4' );

		} );

	} );

	// Half-precision *storage* arrays (`instancedArray(count, 'hmat4'|'hvec4')`), for e.g. a
	// stack of MLP weight matrices multiplied against activation vectors. Unlike uniform
	// arrays (see UniformArrayNode.js), the `storage`/`read_write` WGSL address space has no
	// forced 16-byte array-element stride: `array<mat4x4<f16>>` really is 32 bytes/element and
	// `array<vec4<f16>>` really is 8 bytes/element, half the size of their fp32 equivalents --
	// and, more importantly for a compute-bound MLP, the multiply itself runs at native fp16
	// ALU throughput. `instancedArray()`/`attributeArray()` allocate a real `Uint16Array` of
	// packed fp16 bit patterns for these types (see NodeUtils.getTypedArrayFromType()); this
	// test populates that array directly via `DataUtils.toHalfFloat()` (the same convention
	// `Float16BufferAttribute` uses) the way a real weights buffer would be filled, rather than
	// producing the values from TSL math.
	QUnit.module( 'half precision (fp16) storage arrays', () => {

		gpuTest( 'hmat4 storage buffer * hvec4 storage buffer (MLP-weight-style multiply)', ( { assert } ) => {

			const weightsBuffer = instancedArray( 1, 'hmat4' );
			const scale = new Matrix4().makeScale( 2, 3, 4 );

			scale.elements.forEach( ( v, i ) => {

				weightsBuffer.value.array[ i ] = DataUtils.toHalfFloat( v );

			} );

			const inputBuffer = instancedArray( 1, 'hvec4' );

			[ 1, 1, 1, 1 ].forEach( ( v, i ) => {

				inputBuffer.value.array[ i ] = DataUtils.toHalfFloat( v );

			} );

			const weights = weightsBuffer.element( 0 );
			const input = inputBuffer.element( 0 );

			// A pure per-axis scale matrix times (1,1,1,1) must be exactly (2,3,4,1) --
			// hand-derived from the scale factors, not from the multiply code under test.
			assert.closeAbs( mul( weights, input ), hvec4( 2, 3, 4, 1 ), 1e-3, 'diagonal-scale hmat4 (from storage) times (1,1,1,1) (from storage)' );

		}, { backends: [ 'webgpu' ] } );
		// WebGL has no real storage buffers (three.js's WebGL2 fallback emulates storage via
		// transform feedback for the *harness's own* actual/expected buffers only -- see
		// gpu-test-utils.js's file header -- and never supports an arbitrary user-authored
		// storage buffer like this one), so this is WebGPU-only. It's also WebGPU-only for a
		// second, independent reason: without the `shader-f16` feature, WGSLNodeBuilder now
		// throws rather than silently reading the packed Uint16Array as fp32 garbage (see the
		// guard next to `array< mat4x4<f16> >` generation) -- this environment happens to have
		// `shader-f16` available, so this test exercises the real native-f16 code path, not a
		// fallback.

	} );

} );
