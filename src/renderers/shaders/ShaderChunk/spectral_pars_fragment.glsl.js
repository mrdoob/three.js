export default /* glsl */`

// Spectral rendering configuration
#define SPECTRAL_BINS 15
#define MIN_WAVELENGTH 380.0
#define MAX_WAVELENGTH 780.0

// Convert wavelength to RGB for visualization
vec3 wavelengthToRGB( float wavelength ) {

	float r, g, b;

	if ( wavelength >= 380.0 && wavelength < 440.0 ) {

		r = -( wavelength - 440.0 ) / ( 440.0 - 380.0 );
		g = 0.0;
		b = 1.0;

	} else if ( wavelength >= 440.0 && wavelength < 490.0 ) {

		r = 0.0;
		g = ( wavelength - 440.0 ) / ( 490.0 - 440.0 );
		b = 1.0;

	} else if ( wavelength >= 490.0 && wavelength < 510.0 ) {

		r = 0.0;
		g = 1.0;
		b = -( wavelength - 510.0 ) / ( 510.0 - 490.0 );

	} else if ( wavelength >= 510.0 && wavelength < 580.0 ) {

		r = ( wavelength - 510.0 ) / ( 580.0 - 510.0 );
		g = 1.0;
		b = 0.0;

	} else if ( wavelength >= 580.0 && wavelength < 645.0 ) {

		r = 1.0;
		g = -( wavelength - 645.0 ) / ( 645.0 - 580.0 );
		b = 0.0;

	} else if ( wavelength >= 645.0 && wavelength <= 780.0 ) {

		r = 1.0;
		g = 0.0;
		b = 0.0;

	} else {

		r = 0.0;
		g = 0.0;
		b = 0.0;

	}

	// Apply intensity correction for edge wavelengths
	float factor;

	if ( wavelength >= 380.0 && wavelength < 420.0 ) {

		factor = 0.3 + 0.7 * ( wavelength - 380.0 ) / ( 420.0 - 380.0 );

	} else if ( wavelength >= 420.0 && wavelength < 700.0 ) {

		factor = 1.0;

	} else if ( wavelength >= 700.0 && wavelength <= 780.0 ) {

		factor = 0.3 + 0.7 * ( 780.0 - wavelength ) / ( 780.0 - 700.0 );

	} else {

		factor = 0.0;

	}

	return vec3( r, g, b ) * factor;

}

// Convert RGB to spectral distribution using Gaussian basis functions
// This creates a plausible spectrum that integrates to the given RGB
void rgbToSpectrum( vec3 rgb, out float spectrum[SPECTRAL_BINS] ) {

	float binWidth = ( MAX_WAVELENGTH - MIN_WAVELENGTH ) / float( SPECTRAL_BINS );

	for ( int i = 0; i < SPECTRAL_BINS; i++ ) {

		float wavelength = MIN_WAVELENGTH + ( float( i ) + 0.5 ) * binWidth;
		float value = 0.0;

		// Blue contribution (peak around 450nm)
		float bluePeak = 450.0;
		float blueWidth = 80.0;
		float blueDist = ( wavelength - bluePeak ) / blueWidth;
		value += rgb.b * exp( -0.5 * blueDist * blueDist );

		// Green contribution (peak around 550nm)
		float greenPeak = 550.0;
		float greenWidth = 80.0;
		float greenDist = ( wavelength - greenPeak ) / greenWidth;
		value += rgb.g * exp( -0.5 * greenDist * greenDist );

		// Red contribution (peak around 650nm)
		float redPeak = 650.0;
		float redWidth = 80.0;
		float redDist = ( wavelength - redPeak ) / redWidth;
		value += rgb.r * exp( -0.5 * redDist * redDist );

		spectrum[i] = value;

	}

}

// Convert spectral distribution back to RGB
vec3 spectrumToRGB( float spectrum[SPECTRAL_BINS] ) {

	float binWidth = ( MAX_WAVELENGTH - MIN_WAVELENGTH ) / float( SPECTRAL_BINS );
	vec3 rgb = vec3( 0.0 );

	for ( int i = 0; i < SPECTRAL_BINS; i++ ) {

		float wavelength = MIN_WAVELENGTH + ( float( i ) + 0.5 ) * binWidth;
		vec3 wrgb = wavelengthToRGB( wavelength );

		rgb += spectrum[i] * wrgb * binWidth;

	}

	// Normalize to reasonable range
	float maxVal = max( max( rgb.r, rgb.g ), max( rgb.b, 1.0 ) );
	rgb /= maxVal;

	return rgb;

}

// Multiply two spectra element-wise (for reflectance)
void multiplySpectra( float spectrum1[SPECTRAL_BINS], float spectrum2[SPECTRAL_BINS], out float result[SPECTRAL_BINS] ) {

	for ( int i = 0; i < SPECTRAL_BINS; i++ ) {

		result[i] = spectrum1[i] * spectrum2[i];

	}

}

// Add two spectra together
void addSpectra( float spectrum1[SPECTRAL_BINS], float spectrum2[SPECTRAL_BINS], out float result[SPECTRAL_BINS] ) {

	for ( int i = 0; i < SPECTRAL_BINS; i++ ) {

		result[i] = spectrum1[i] + spectrum2[i];

	}

}

// Scale a spectrum by a scalar
void scaleSpectrum( float spectrum[SPECTRAL_BINS], float scale, out float result[SPECTRAL_BINS] ) {

	for ( int i = 0; i < SPECTRAL_BINS; i++ ) {

		result[i] = spectrum[i] * scale;

	}

}

`;
