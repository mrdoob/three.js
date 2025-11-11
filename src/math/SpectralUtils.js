/**
 * Spectral rendering utilities using Spectral Primary Decomposition.
 *
 * Based on "Spectral Primary Decomposition for Rendering with sRGB Reflectance"
 * by Ian Mallett and Cem Yuksel (EGSR 2019)
 * and implementation from https://github.com/MomentsInGraphics/path_tracer
 *
 * This method represents reflectance spectra using 3 Fourier coefficients,
 * guaranteeing physically valid reflectance values (0-1) and perfect
 * reproduction of input sRGB colors under D65 illumination.
 */

// Visible spectrum range (CIE standard)
const MIN_WAVELENGTH = 360;
const MAX_WAVELENGTH = 830;

/**
 * Convert linear sRGB to Fourier coefficients (trigonometric moments).
 * These coefficients represent the reflectance spectrum in Fourier space.
 *
 * @param {number} r - Linear red component (0-1)
 * @param {number} g - Linear green component (0-1)
 * @param {number} b - Linear blue component (0-1)
 * @returns {Object} Object with fourier array [c0, c1, c2]
 */
function srgbToFourier( r, g, b ) {

	// Linear transformation matrix from the Spectral Primary Decomposition paper
	// These coefficients were optimized to reproduce sRGB under D65 illumination
	const c0 = 0.2276800310 * r + 0.4748793271 * g + 0.2993498525 * b;
	const c1 = 0.2035160895 * r + 0.0770505049 * g - 0.2808208130 * b;
	const c2 = 0.1563903497 * r - 0.3230828819 * g + 0.1668540863 * b;

	return { fourier: [ c0, c1, c2 ] };

}

/**
 * Evaluate a real Fourier series with 3 coefficients.
 *
 * @param {number} cosPhase - cos(phase)
 * @param {number} sinPhase - sin(phase)
 * @param {Array} fouriers - Array of 3 Fourier coefficients [c0, c1, c2]
 * @returns {number} Evaluated Fourier series value
 */
function evalFourierSeriesReal3( cosPhase, sinPhase, fouriers ) {

	const cos1 = cosPhase;
	const cos2 = cosPhase * cosPhase - sinPhase * sinPhase; // cos(2*phase)

	return 2.0 * ( fouriers[ 1 ] * cos1 + fouriers[ 2 ] * cos2 + 0.5 * fouriers[ 0 ] );

}

/**
 * Prepare Lagrange multipliers from trigonometric moments with biasing.
 * Uses Levinson's algorithm to solve a 3x3 Toeplitz system.
 *
 * @param {Array} trigMoments - Array of 3 trigonometric moments (modified in place)
 * @returns {Array} Array of 3 Lagrange multipliers
 */
function prepReflectanceRealLagrangeBiased3( trigMoments ) {

	// Clamp first moment to valid range
	trigMoments[ 0 ] = Math.max( 0.0001, Math.min( 0.9999, trigMoments[ 0 ] ) );

	// Convert to exponential moments (Equation 6 from the paper)
	const expMoments = [
		trigMoments[ 0 ],
		trigMoments[ 1 ] / trigMoments[ 0 ],
		trigMoments[ 2 ] / trigMoments[ 0 ]
	];

	// Bias correction (Equation 7)
	const bias = 1e-5;
	expMoments[ 0 ] = ( 1.0 - bias ) * expMoments[ 0 ] + bias * 0.5;

	// Levinson's algorithm for solving 3x3 Toeplitz system (Equation 10)
	// This computes the Lagrange multipliers that guarantee valid reflectance
	const r0 = expMoments[ 0 ];
	const r1 = expMoments[ 1 ];
	const r2 = expMoments[ 2 ];

	// First step
	const a1 = - r1 / r0;
	const p1 = 1.0 + a1 * a1;
	const q1 = a1;

	// Second step
	const numerator = - ( r2 + r1 * q1 );
	const denominator = r0 * p1;
	const a2 = numerator / denominator;

	const lagranges = [
		1.0 + a1 * q1 + a2 * r1,
		q1 + a1 + a2 * q1,
		a2
	];

	return lagranges;

}

/**
 * Evaluate reflectance at a given phase using Lagrange polynomials.
 * Phase represents a warped wavelength in circular space.
 *
 * @param {number} phase - Phase angle (related to wavelength)
 * @param {Array} lagranges - Array of 3 Lagrange multipliers
 * @returns {number} Reflectance value (guaranteed to be in 0-1 range)
 */
function evalReflectanceRealLagrange3( phase, lagranges ) {

	// Conjugate circle point: e^(-i*phase)
	const cosPhase = Math.cos( - phase );
	const sinPhase = Math.sin( - phase );

	// Evaluate Lagrange series
	const lagrangeSeries = evalFourierSeriesReal3( cosPhase, sinPhase, lagranges );

	// Convert to reflectance using arctangent (this guarantees 0-1 range)
	return Math.atan( lagrangeSeries ) / Math.PI + 0.5;

}

/**
 * Convert wavelength (in nm) to phase for Fourier representation.
 * The phase wraps the wavelength space into a circle.
 *
 * @param {number} wavelength - Wavelength in nanometers (360-830)
 * @returns {number} Phase angle in radians
 */
function wavelengthToPhase( wavelength ) {

	// Normalize wavelength to [0, 1]
	const t = ( wavelength - MIN_WAVELENGTH ) / ( MAX_WAVELENGTH - MIN_WAVELENGTH );

	// Map to phase [0, 2π]
	return t * 2.0 * Math.PI;

}

/**
 * Convert wavelength (in nm) to approximate RGB color for visualization.
 * Uses CIE-based approximation.
 *
 * @param {number} wavelength - Wavelength in nanometers (360-830)
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
 * Convert RGB color to Lagrange coefficients for spectral rendering.
 * This is the main function to use for converting material colors.
 *
 * @param {number} r - Linear red component (0-1)
 * @param {number} g - Linear green component (0-1)
 * @param {number} b - Linear blue component (0-1)
 * @returns {Array} Array of 3 Lagrange multipliers for spectral evaluation
 */
function rgbToSpectralCoefficients( r, g, b ) {

	// Step 1: Convert sRGB to Fourier coefficients (trigonometric moments)
	const { fourier } = srgbToFourier( r, g, b );

	// Step 2: Prepare Lagrange multipliers from the Fourier coefficients
	const lagranges = prepReflectanceRealLagrangeBiased3( fourier );

	return lagranges;

}

/**
 * Evaluate spectral reflectance at a specific wavelength.
 *
 * @param {number} wavelength - Wavelength in nanometers (360-830)
 * @param {Array} lagranges - Array of 3 Lagrange multipliers
 * @returns {number} Reflectance value (0-1)
 */
function evalReflectanceAtWavelength( wavelength, lagranges ) {

	const phase = wavelengthToPhase( wavelength );
	return evalReflectanceRealLagrange3( phase, lagranges );

}

/**
 * Convert spectral coefficients back to RGB by integrating over wavelengths.
 * This samples the spectrum at multiple wavelengths and accumulates RGB.
 *
 * @param {Array} lagranges - Array of 3 Lagrange multipliers
 * @param {number} numSamples - Number of wavelength samples (default: 32)
 * @returns {Object} RGB object with r, g, b values
 */
function spectralCoefficientsToRGB( lagranges, numSamples = 32 ) {

	let r = 0, g = 0, b = 0;

	for ( let i = 0; i < numSamples; i ++ ) {

		const t = ( i + 0.5 ) / numSamples;
		const wavelength = MIN_WAVELENGTH + t * ( MAX_WAVELENGTH - MIN_WAVELENGTH );

		const reflectance = evalReflectanceAtWavelength( wavelength, lagranges );
		const rgb = wavelengthToRGB( wavelength );

		r += reflectance * rgb.r;
		g += reflectance * rgb.g;
		b += reflectance * rgb.b;

	}

	// Normalize
	const scale = 1.0 / numSamples;
	r *= scale;
	g *= scale;
	b *= scale;

	// Normalize to max of 1
	const maxVal = Math.max( r, g, b, 1.0 );
	r /= maxVal;
	g /= maxVal;
	b /= maxVal;

	return { r, g, b };

}

export {
	MIN_WAVELENGTH,
	MAX_WAVELENGTH,
	srgbToFourier,
	evalFourierSeriesReal3,
	prepReflectanceRealLagrangeBiased3,
	evalReflectanceRealLagrange3,
	wavelengthToPhase,
	wavelengthToRGB,
	rgbToSpectralCoefficients,
	evalReflectanceAtWavelength,
	spectralCoefficientsToRGB
};
