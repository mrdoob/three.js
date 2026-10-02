import { SH_BAND_COMPONENTS, SH_BAND_WORDS } from '../../../../examples/jsm/utils/GaussianSplatUtils.js';

/**
 * Maps an SH scalar coefficient index within a band to its packed uint32
 * storage location. Coefficients are RGB-interleaved within each band
 * (vector0.rgb, vector1.rgb, ...).
 *
 * @param {number} coefficient - Scalar coefficient index within the band.
 * @return {{ word: number, shift: number }} Packed word index and bit shift.
 */
function getSphericalHarmonicsCoefficientLocation( coefficient ) {

	return {
		word: coefficient >> 2,
		shift: ( coefficient & 3 ) << 3
	};

}

/**
 * Packs clamped-byte SH coefficients into uint32 words (four bytes per word).
 * Each coefficient uses the geometry encoding `( value - 128 ) / 128`.
 *
 * @param {Uint8Array|Uint8ClampedArray} source - Clamped-byte coefficients.
 * @param {number} count - Splat count.
 * @param {number} degree - Spherical harmonics band degree in `[1, 3]`.
 * @return {Uint32Array} Packed words with `count * SH_BAND_WORDS[ degree ]` elements.
 */
function packSphericalHarmonicsBand( source, count, degree ) {

	const componentCount = SH_BAND_COMPONENTS[ degree ];
	const words = SH_BAND_WORDS[ degree ];
	const data = new Uint32Array( count * words );

	for ( let i = 0; i < count; i ++ ) {

		const sourceBase = i * componentCount;
		const targetBase = i * words;

		for ( let j = 0; j < componentCount; j ++ ) {

			const { word, shift } = getSphericalHarmonicsCoefficientLocation( j );
			data[ targetBase + word ] |= source[ sourceBase + j ] << shift;

		}

	}

	return data;

}

/**
 * Unpacks uint32 SH words back to clamped-byte coefficients.
 *
 * @param {Uint32Array} packed - Packed words from {@link packSphericalHarmonicsBand}.
 * @param {number} count - Splat count.
 * @param {number} degree - Spherical harmonics band degree in `[1, 3]`.
 * @return {Uint8ClampedArray} Clamped-byte coefficients.
 */
function unpackSphericalHarmonicsBand( packed, count, degree ) {

	const componentCount = SH_BAND_COMPONENTS[ degree ];
	const words = SH_BAND_WORDS[ degree ];
	const data = new Uint8ClampedArray( count * componentCount );

	for ( let i = 0; i < count; i ++ ) {

		const sourceBase = i * words;
		const targetBase = i * componentCount;

		for ( let j = 0; j < componentCount; j ++ ) {

			const { word, shift } = getSphericalHarmonicsCoefficientLocation( j );
			data[ targetBase + j ] = ( packed[ sourceBase + word ] >>> shift ) & 0xff;

		}

	}

	return data;

}

export {
	getSphericalHarmonicsCoefficientLocation,
	packSphericalHarmonicsBand,
	unpackSphericalHarmonicsBand
};
