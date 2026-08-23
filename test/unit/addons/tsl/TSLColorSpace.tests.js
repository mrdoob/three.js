import {
	vec3,
	sRGBTransferEOTF, sRGBTransferOETF
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// sRGB <-> linear-sRGB transfer function coverage. Every expected value below
// is the plain IEC 61966-2-1 piecewise formula, hand-evaluated independently
// in this file's comments (not derived by re-running the TSL expressions
// under test) -- see TSLMath.tests.js's file header for why that matters
// (https://ben3d.ca/blog/the-rise-of-test-theater).
//
// EOTF (decode: sRGB -> linear):
//   x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ^ 2.4
// OETF (encode: linear -> sRGB):
//   x <= 0.0031308 ? x * 12.92 : 1.055 * x^(1/2.4) - 0.055
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'color space functions', () => {

		gpuTest( 'sRGBTransferEOTF() decodes sRGB to linear', ( { assert } ) => {

			// Exact endpoints.
			assert.closeAbs( sRGBTransferEOTF( vec3( 0, 0, 0 ) ), vec3( 0, 0, 0 ), 1e-6, 'EOTF(0) == 0' );
			assert.closeAbs( sRGBTransferEOTF( vec3( 1, 1, 1 ) ), vec3( 1, 1, 1 ), 1e-4, 'EOTF(1) == 1' );

			// Below the linear-segment threshold (0.04045): x / 12.92.
			// sRGBTransferEOTF() is declared (via setLayout) as taking/returning
			// vec3, so scalar inputs must be broadcast to vec3 explicitly --
			// a bare float() input still comes back typed vec3, which a bare
			// float() expected value can't be compared against.
			assert.closeAbs( sRGBTransferEOTF( vec3( 0.02 ) ), vec3( 0.02 / 12.92 ), 1e-6, 'EOTF(0.02) uses the linear low-end segment' );

			// Above the threshold: ((x + 0.055) / 1.055) ^ 2.4 -- checked at a
			// well-known reference point (sRGB mid-gray 0.5 -> ~0.2140 linear).
			assert.closeAbs( sRGBTransferEOTF( vec3( 0.5 ) ), vec3( Math.pow( ( 0.5 + 0.055 ) / 1.055, 2.4 ) ), 1e-4, 'EOTF(0.5) uses the power-curve segment' );
			assert.closeAbs( sRGBTransferEOTF( vec3( 0.5 ) ), vec3( 0.21404114 ), 1e-4, 'EOTF(0.5) matches the well-known sRGB mid-gray linear value' );

		} );

		gpuTest( 'sRGBTransferOETF() encodes linear to sRGB', ( { assert } ) => {

			// Exact endpoints.
			assert.closeAbs( sRGBTransferOETF( vec3( 0, 0, 0 ) ), vec3( 0, 0, 0 ), 1e-6, 'OETF(0) == 0' );
			assert.closeAbs( sRGBTransferOETF( vec3( 1, 1, 1 ) ), vec3( 1, 1, 1 ), 1e-4, 'OETF(1) == 1' );

			// Below the linear-segment threshold (0.0031308): x * 12.92.
			assert.closeAbs( sRGBTransferOETF( vec3( 0.001 ) ), vec3( 0.001 * 12.92 ), 1e-6, 'OETF(0.001) uses the linear low-end segment' );

			// Above the threshold: 1.055 * x^(1/2.4) - 0.055 -- checked against
			// the same linear mid-gray value used above, in reverse.
			assert.closeAbs( sRGBTransferOETF( vec3( 0.21404114 ) ), vec3( 0.5 ), 1e-3, 'OETF(0.21404114) round-trips back to sRGB mid-gray 0.5' );

			assert.closeAbs( sRGBTransferOETF( vec3( 1 ) ), vec3( 1 ), 1e-4, 'OETF(1) == 1' );

		} );

		gpuTest( 'sRGBTransferEOTF() and sRGBTransferOETF() are inverses of each other', ( { assert } ) => {

			// Round-trip check using values independently known from the tests
			// above -- not by feeding a value through both functions and
			// comparing to itself with no other reference (that alone would be
			// test theater), but the *shape* of a round-trip is still a useful,
			// additional cross-check once each direction is independently
			// verified against the closed-form formula above.
			const linear = vec3( 0.02, 0.2140411, 0.8 );
			const roundTrip = sRGBTransferEOTF( sRGBTransferOETF( linear ) );

			assert.closeAbs( roundTrip, linear, 1e-3, 'EOTF(OETF(x)) == x' );

		} );

	} );

} );
