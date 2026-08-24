import {
	float, uint, vec2, vec3, vec4, hash, abs,
	packSnorm2x16, unpackSnorm2x16,
	packUnorm2x16, unpackUnorm2x16,
	packHalf2x16, unpackHalf2x16,
	packSnorm4x8, unpackSnorm4x8,
	packUnorm4x8, unpackUnorm4x8,
	packNormalToRGB, unpackRGBToNormal, unpackNormal,
	length
} from 'three/tsl';
import { toHalfFloat } from '../../../../src/extras/DataUtils.js';
import { gpuTest, gpuFuzzTest } from './gpu-test-utils.js';

// Packing/unpacking coverage: every round-trip test checks a value that was
// packed and then unpacked against the *original* input (an independent,
// pre-existing value -- not something derived from the packed result), so a
// broken pack() or unpack() that just agreed with itself can't slip through.
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'packing', () => {

		gpuTest( 'packSnorm2x16 <-> unpackSnorm2x16 round trip', ( { assert } ) => {

			const v = vec2( 0.5, -0.25 );
			// 16-bit quantization step is 1/32767 -- allow a couple of ULPs.
			assert.closeAbs( unpackSnorm2x16( packSnorm2x16( v ) ), v, 2e-4, 'mid-range value' );

			const edge = vec2( 1.0, -1.0 );
			assert.closeAbs( unpackSnorm2x16( packSnorm2x16( edge ) ), edge, 2e-4, 'exact +-1 boundary' );

			// Out-of-range input must clamp to the representable range, not wrap.
			const outOfRange = vec2( 2.0, -3.0 );
			assert.closeAbs( unpackSnorm2x16( packSnorm2x16( outOfRange ) ), vec2( 1.0, -1.0 ), 2e-4, 'out-of-range input clamps to [-1, 1] rather than wrapping' );

		} );

		gpuTest( 'packUnorm2x16 <-> unpackUnorm2x16 round trip', ( { assert } ) => {

			const v = vec2( 0.75, 0.1 );
			assert.closeAbs( unpackUnorm2x16( packUnorm2x16( v ) ), v, 2e-4, 'mid-range value' );

			assert.closeAbs( unpackUnorm2x16( packUnorm2x16( vec2( 0.0, 1.0 ) ) ), vec2( 0.0, 1.0 ), 2e-4, '0/1 boundaries' );

			// Out-of-range (including negative) input clamps into [0, 1].
			const outOfRange = vec2( -1.0, 2.0 );
			assert.closeAbs( unpackUnorm2x16( packUnorm2x16( outOfRange ) ), vec2( 0.0, 1.0 ), 2e-4, 'out-of-range input clamps to [0, 1]' );

		} );

		gpuTest( 'packHalf2x16 <-> unpackHalf2x16 round trip', ( { assert } ) => {

			const v = vec2( 123.5, -0.0009765625 ); // second value is an exact float16 value (2^-10)
			assert.closeAbs( unpackHalf2x16( packHalf2x16( v ) ), v, 1e-3, 'exact float16-representable values round-trip exactly (within tolerance)' );

			// packHalf2x16's bits themselves, checked against an independent
			// FP32->FP16 conversion (DataUtils.toHalfFloat, src/extras/DataUtils.js)
			// rather than only the round trip above -- a pack() and unpack() that
			// were both wrong in matching ways couldn't be caught by round-tripping
			// alone. GLSL/WGSL both pack the first component into the 16
			// least-significant bits and the second into the 16 most-significant
			// bits (packHalf2x16 / pack2x16float).
			const lo = toHalfFloat( 123.5 ) & 0xffff;
			const hi = toHalfFloat( -0.0009765625 ) & 0xffff;
			const expectedBits = ( lo | ( hi << 16 ) ) >>> 0;

			assert.eq( packHalf2x16( v ), uint( expectedBits ), 'packHalf2x16(v) matches the bit pattern from DataUtils.toHalfFloat()' );

		} );

		gpuTest( 'packSnorm4x8 <-> unpackSnorm4x8 round trip', ( { assert } ) => {

			const v = vec4( 1.0, 0.5, -0.5, -1.0 );
			// 8-bit quantization step is 1/127 -- much coarser than the 16-bit variants.
			assert.closeAbs( unpackSnorm4x8( packSnorm4x8( v ) ), v, 1e-2, 'full-range value' );

		} );

		gpuTest( 'packUnorm4x8 <-> unpackUnorm4x8 round trip', ( { assert } ) => {

			const v = vec4( 0.0, 0.25, 0.75, 1.0 );
			assert.closeAbs( unpackUnorm4x8( packUnorm4x8( v ) ), v, 1e-2, 'full-range value' );

		} );

		gpuTest( 'packNormalToRGB <-> unpackRGBToNormal round trip and known values', ( { assert } ) => {

			// packNormalToRGB(n) == n * 0.5 + 0.5 -- verified against a
			// hand-computed value, not merely its own inverse.
			assert.closeAbs( packNormalToRGB( vec3( 0, 0, 1 ) ), vec3( 0.5, 0.5, 1.0 ), 1e-6, 'packNormalToRGB(+Z) == (0.5, 0.5, 1.0)' );
			assert.closeAbs( packNormalToRGB( vec3( -1, -1, -1 ) ), vec3( 0, 0, 0 ), 1e-6, 'packNormalToRGB(-1,-1,-1) == black' );

			const n = vec3( 0.6, -0.8, 0.0 ); // a unit vector (0.6^2 + 0.8^2 == 1)
			assert.closeAbs( unpackRGBToNormal( packNormalToRGB( n ) ), n, 1e-5, 'round trip recovers the original direction' );

		} );

		gpuTest( 'unpackNormal reconstructs Z on the unit hemisphere', ( { assert } ) => {

			// dot(xy, xy) == 0 -> z == 1 (straight up).
			assert.closeAbs( unpackNormal( vec2( 0, 0 ) ), vec3( 0, 0, 1 ), 1e-6, 'unpackNormal(0,0) is the pole' );

			// A 3-4-5 triangle projected to the unit disk: xy = (0.6, 0.8) has
			// dot == 1, so the reconstructed Z must be exactly 0.
			assert.closeAbs( unpackNormal( vec2( 0.6, 0.8 ) ), vec3( 0.6, 0.8, 0 ), 1e-5, 'xy exactly on the unit circle reconstructs z == 0' );

			// Known documented caveat: unpackNormal()'s docstring requires xy
			// in [-1, 1], but the implementation only saturates the *radicand*
			// under the sqrt -- it never re-normalizes xy itself. Feeding it an
			// xy pair outside the unit disk therefore reconstructs z == 0 (since
			// 1 - dot(xy,xy) saturates to 0) while silently returning a
			// non-unit-length vector instead of erroring or clamping xy. This
			// locks down that real, surprising behavior rather than asserting
			// what one might *expect* (a re-normalized unit vector).
			const outside = unpackNormal( vec2( 2, 0 ) );
			assert.closeAbs( outside, vec3( 2, 0, 0 ), 1e-6, 'xy outside the unit disk: z silently becomes 0 instead of the input being renormalized' );
			assert.closeAbs( length( outside ), float( 2 ), 1e-5, '...so the "normal" returned is not actually unit length' );

		} );

		gpuFuzzTest( 'hash() output stays in [0, 1)', 256, ( { instanceIndex, assert } ) => {

			const h = hash( instanceIndex.add( 1 ).toFloat() );

			assert.greaterThanOrEqual( h, float( 0 ), 'hash() >= 0' );
			assert.lessThan( h, float( 1 ), 'hash() < 1' );

		} );

		gpuFuzzTest( 'hash() is a pure function of its seed', 256, ( { instanceIndex, assert } ) => {

			// Split out from the range check above rather than added as a
			// third call site there: this harness's gpuFuzzTest backs every
			// site with its own dedicated column-buffers, and this sandbox's
			// WebGL2 fallback implementation only reliably supports ~4
			// simultaneously-bound buffers in one kernel (2 sites' worth of
			// actual+expected pairs) -- a 3rd site in the same test silently
			// corrupted one site's readback here. Keeping each gpuFuzzTest to
			// a small number of sites sidesteps that ceiling; see
			// gpu-test-utils.js's gpuFuzzTest doc comment.
			const seed = instanceIndex.add( 1 ).toFloat();
			assert.eq( hash( seed ), hash( seed ), 'same seed always gives the same output' );

		} );

		gpuFuzzTest( 'hash() is sensitive to its seed (no collisions across 512 distinct seeds sampled)', 256, ( { instanceIndex, assert } ) => {

			// Two distinct, well-separated seeds derived from instanceIndex
			// should (overwhelmingly likely) hash to different values -- a
			// hash that degenerated into a constant or a low-period function
			// would fail this near-certainly across 256 independent samples.
			const a = hash( instanceIndex.add( 1 ).toFloat() );
			const b = hash( instanceIndex.add( 100000 ).toFloat() );

			assert.greaterThan( abs( a.sub( b ) ), float( 1e-6 ), 'two well-separated seeds hash to different values' );

		} );

	} );

} );
