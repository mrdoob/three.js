/**
 * Utilities for spectral rendering - converting between RGB and spectral representations.
 *
 * This uses a binning approach where the visible spectrum (380-780nm) is divided into
 * discrete wavelength bins. RGB colors are converted to spectral distributions and
 * vice versa using a smooth basis function approach.
 */

// Number of spectral bins (wavelength samples)
const SPECTRAL_BINS = 15;

// Visible spectrum range in nanometers
const MIN_WAVELENGTH = 380;
const MAX_WAVELENGTH = 780;

/**
 * Convert wavelength (in nm) to approximate RGB color for visualization.
 * Based on wavelength-to-RGB conversion for pure spectral colors.
 *
 * @param {number} wavelength - Wavelength in nanometers (380-780)
 * @returns {Object} RGB object with r, g, b values in range [0,1]
 */
function wavelengthToRGB( wavelength ) {

	let r, g, b;

	if ( wavelength >= 380 && wavelength < 440 ) {

		r = - ( wavelength - 440 ) / ( 440 - 380 );
		g = 0.0;
		b = 1.0;

	} else if ( wavelength >= 440 && wavelength < 490 ) {

		r = 0.0;
		g = ( wavelength - 440 ) / ( 490 - 440 );
		b = 1.0;

	} else if ( wavelength >= 490 && wavelength < 510 ) {

		r = 0.0;
		g = 1.0;
		b = - ( wavelength - 510 ) / ( 510 - 490 );

	} else if ( wavelength >= 510 && wavelength < 580 ) {

		r = ( wavelength - 510 ) / ( 580 - 510 );
		g = 1.0;
		b = 0.0;

	} else if ( wavelength >= 580 && wavelength < 645 ) {

		r = 1.0;
		g = - ( wavelength - 645 ) / ( 645 - 580 );
		b = 0.0;

	} else if ( wavelength >= 645 && wavelength <= 780 ) {

		r = 1.0;
		g = 0.0;
		b = 0.0;

	} else {

		r = 0.0;
		g = 0.0;
		b = 0.0;

	}

	// Apply intensity correction for edge wavelengths
	let factor;

	if ( wavelength >= 380 && wavelength < 420 ) {

		factor = 0.3 + 0.7 * ( wavelength - 380 ) / ( 420 - 380 );

	} else if ( wavelength >= 420 && wavelength < 700 ) {

		factor = 1.0;

	} else if ( wavelength >= 700 && wavelength <= 780 ) {

		factor = 0.3 + 0.7 * ( 780 - wavelength ) / ( 780 - 700 );

	} else {

		factor = 0.0;

	}

	return { r: r * factor, g: g * factor, b: b * factor };

}

/**
 * Convert RGB color to spectral distribution using smooth basis functions.
 * This creates a plausible spectral distribution that integrates to the given RGB.
 *
 * @param {number} r - Red component (0-1)
 * @param {number} g - Green component (0-1)
 * @param {number} b - Blue component (0-1)
 * @returns {Float32Array} Spectral distribution with SPECTRAL_BINS values
 */
function rgbToSpectrum( r, g, b ) {

	const spectrum = new Float32Array( SPECTRAL_BINS );
	const binWidth = ( MAX_WAVELENGTH - MIN_WAVELENGTH ) / SPECTRAL_BINS;

	// Convert RGB to spectral using smooth Gaussian-like basis functions
	// This is a simplified approach - more accurate methods exist but are more complex

	for ( let i = 0; i < SPECTRAL_BINS; i ++ ) {

		const wavelength = MIN_WAVELENGTH + ( i + 0.5 ) * binWidth;
		let value = 0;

		// Blue contribution (peak around 450nm)
		const bluePeak = 450;
		const blueWidth = 80;
		const blueDist = ( wavelength - bluePeak ) / blueWidth;
		value += b * Math.exp( - 0.5 * blueDist * blueDist );

		// Green contribution (peak around 550nm)
		const greenPeak = 550;
		const greenWidth = 80;
		const greenDist = ( wavelength - greenPeak ) / greenWidth;
		value += g * Math.exp( - 0.5 * greenDist * greenDist );

		// Red contribution (peak around 650nm)
		const redPeak = 650;
		const redWidth = 80;
		const redDist = ( wavelength - redPeak ) / redWidth;
		value += r * Math.exp( - 0.5 * redDist * redDist );

		spectrum[ i ] = value;

	}

	return spectrum;

}

/**
 * Convert spectral distribution to RGB using CIE color matching functions.
 * This is a simplified version - production code would use full CIE 1931 tables.
 *
 * @param {Float32Array|Array} spectrum - Spectral distribution with SPECTRAL_BINS values
 * @returns {Object} RGB object with r, g, b values in range [0,1]
 */
function spectrumToRGB( spectrum ) {

	const binWidth = ( MAX_WAVELENGTH - MIN_WAVELENGTH ) / SPECTRAL_BINS;
	let r = 0, g = 0, b = 0;

	// Simplified CIE color matching - integrate spectrum against RGB basis
	for ( let i = 0; i < SPECTRAL_BINS; i ++ ) {

		const wavelength = MIN_WAVELENGTH + ( i + 0.5 ) * binWidth;
		const rgb = wavelengthToRGB( wavelength );

		r += spectrum[ i ] * rgb.r * binWidth;
		g += spectrum[ i ] * rgb.g * binWidth;
		b += spectrum[ i ] * rgb.b * binWidth;

	}

	// Normalize to reasonable range
	const max = Math.max( r, g, b, 1.0 );
	r /= max;
	g /= max;
	b /= max;

	return { r, g, b };

}

/**
 * Multiply two spectra (for reflectance calculation).
 *
 * @param {Float32Array|Array} spectrum1 - First spectrum
 * @param {Float32Array|Array} spectrum2 - Second spectrum
 * @returns {Float32Array} Result spectrum
 */
function multiplySpectra( spectrum1, spectrum2 ) {

	const result = new Float32Array( SPECTRAL_BINS );

	for ( let i = 0; i < SPECTRAL_BINS; i ++ ) {

		result[ i ] = spectrum1[ i ] * spectrum2[ i ];

	}

	return result;

}

/**
 * Add two spectra together.
 *
 * @param {Float32Array|Array} spectrum1 - First spectrum
 * @param {Float32Array|Array} spectrum2 - Second spectrum
 * @returns {Float32Array} Result spectrum
 */
function addSpectra( spectrum1, spectrum2 ) {

	const result = new Float32Array( SPECTRAL_BINS );

	for ( let i = 0; i < SPECTRAL_BINS; i ++ ) {

		result[ i ] = spectrum1[ i ] + spectrum2[ i ];

	}

	return result;

}

/**
 * Scale a spectrum by a scalar value.
 *
 * @param {Float32Array|Array} spectrum - Input spectrum
 * @param {number} scale - Scale factor
 * @returns {Float32Array} Result spectrum
 */
function scaleSpectrum( spectrum, scale ) {

	const result = new Float32Array( SPECTRAL_BINS );

	for ( let i = 0; i < SPECTRAL_BINS; i ++ ) {

		result[ i ] = spectrum[ i ] * scale;

	}

	return result;

}

export {
	SPECTRAL_BINS,
	MIN_WAVELENGTH,
	MAX_WAVELENGTH,
	wavelengthToRGB,
	rgbToSpectrum,
	spectrumToRGB,
	multiplySpectra,
	addSpectra,
	scaleSpectrum
};
