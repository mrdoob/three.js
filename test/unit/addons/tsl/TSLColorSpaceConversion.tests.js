import { vec4, convertColorSpace, workingToColorSpace, colorSpaceToWorking, sRGBTransferEOTF, sRGBTransferOETF } from 'three/tsl';
import { SRGBColorSpace, LinearSRGBColorSpace } from 'three';
import { gpuTest } from './gpu-test-utils.js';

// Coverage for convertColorSpace()/workingToColorSpace()/colorSpaceToWorking()
// in src/nodes/display/ColorSpaceNode.js, for the sRGB <-> linear-sRGB pair.
//
// ColorSpaceNode.setup() (read directly, not re-run) skips the general
// primaries-matrix path whenever source and target share the same color
// primaries -- true for 'srgb' and 'srgb-linear', which are both Rec.709 --
// and applies only the transfer-function step for whichever side is
// sRGB-encoded. So for this specific pair, the conversion reduces to
// exactly sRGBTransferEOTF()/sRGBTransferOETF(), letting expected values be
// derived from those already-independently-covered functions (see
// TSLConversion.tests.js) rather than from re-deriving ColorSpaceNode's own
// matrix machinery.
//
// The default working color space is LinearSRGBColorSpace (see
// ColorManagement.js), which this suite never overrides.
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'color space conversion', () => {

		gpuTest( 'colorSpaceToWorking(sRGB) applies the sRGB EOTF (sRGB -> linear-sRGB working space)', ( { assert } ) => {

			const color = vec4( 0.5, 0.25, 0.75, 1 );
			const expected = vec4( sRGBTransferEOTF( color.rgb ), 1 );

			assert.closeAbs( colorSpaceToWorking( color, SRGBColorSpace ), expected, 1e-5, 'colorSpaceToWorking(c, SRGBColorSpace) == vec4(sRGBTransferEOTF(c.rgb), c.a)' );

		} );

		gpuTest( 'workingToColorSpace(sRGB) applies the sRGB OETF (linear-sRGB working space -> sRGB)', ( { assert } ) => {

			const color = vec4( 0.5, 0.25, 0.75, 1 );
			const expected = vec4( sRGBTransferOETF( color.rgb ), 1 );

			assert.closeAbs( workingToColorSpace( color, SRGBColorSpace ), expected, 1e-5, 'workingToColorSpace(c, SRGBColorSpace) == vec4(sRGBTransferOETF(c.rgb), c.a)' );

		} );

		gpuTest( 'convertColorSpace(sRGB, linear-sRGB) matches colorSpaceToWorking(sRGB)', ( { assert } ) => {

			// LinearSRGBColorSpace is the default working color space, so
			// converting explicitly TO it must agree with converting FROM
			// sRGB to the (implicit) working space.
			const color = vec4( 0.9, 0.1, 0.4, 0.6 );

			assert.closeAbs(
				convertColorSpace( color, SRGBColorSpace, LinearSRGBColorSpace ),
				colorSpaceToWorking( color, SRGBColorSpace ),
				1e-5, 'convertColorSpace(c, sRGB, linear-sRGB) matches colorSpaceToWorking(c, sRGB)'
			);

		} );

		gpuTest( 'colorSpaceToWorking() and workingToColorSpace() round-trip an sRGB color', ( { assert } ) => {

			const original = vec4( 0.6, 0.3, 0.9, 1 );
			const roundTripped = workingToColorSpace( colorSpaceToWorking( original, SRGBColorSpace ), SRGBColorSpace );

			assert.closeAbs( roundTripped, original, 1e-4, 'workingToColorSpace(colorSpaceToWorking(c)) recovers the original color' );

		} );

		gpuTest( 'converting between the same color space is the identity', ( { assert } ) => {

			// ColorSpaceNode.setup() explicitly early-returns the input
			// unchanged when source === target.
			const color = vec4( 0.2, 0.7, 0.5, 0.8 );
			assert.eq( convertColorSpace( color, SRGBColorSpace, SRGBColorSpace ), color, 'convertColorSpace(c, X, X) is the identity' );

		} );

	} );

} );
