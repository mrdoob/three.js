export default /* glsl */`

// Spectral rendering using Spectral Primary Decomposition
// Based on "Spectral Primary Decomposition for Rendering with sRGB Reflectance"
// by Ian Mallett and Cem Yuksel (EGSR 2019)

// CIE standard visible spectrum range
#define MIN_WAVELENGTH 360.0
#define MAX_WAVELENGTH 830.0
#define PI 3.14159265359

// Convert linear sRGB to Fourier coefficients (trigonometric moments)
// Returns 3 Fourier coefficients optimized for D65 illumination
vec3 srgbToFourier( vec3 rgb ) {
	// Linear transformation matrix from Spectral Primary Decomposition paper
	return vec3(
		dot( vec3( 0.2276800310, 0.4748793271, 0.2993498525 ), rgb ),
		dot( vec3( 0.2035160895, 0.0770505049, -0.2808208130 ), rgb ),
		dot( vec3( 0.1563903497, -0.3230828819, 0.1668540863 ), rgb )
	);
}

// Evaluate real Fourier series with 3 coefficients
float evalFourierSeriesReal3( vec2 point, vec3 fouriers ) {
	float cos1 = point.x;
	float cos2 = point.x * point.x - point.y * point.y; // cos(2*phase)
	return 2.0 * ( fouriers.y * cos1 + fouriers.z * cos2 + 0.5 * fouriers.x );
}

// Prepare Lagrange multipliers from trigonometric moments using Levinson's algorithm
// This guarantees physically valid reflectance (0-1)
vec3 prepReflectanceRealLagrangeBiased3( inout vec3 trigMoments ) {
	// Clamp first moment to valid range
	trigMoments.x = clamp( trigMoments.x, 0.0001, 0.9999 );

	// Convert to exponential moments (Equation 6)
	vec3 expMoments = vec3(
		trigMoments.x,
		trigMoments.y / trigMoments.x,
		trigMoments.z / trigMoments.x
	);

	// Bias correction (Equation 7)
	float bias = 1e-5;
	expMoments.x = ( 1.0 - bias ) * expMoments.x + bias * 0.5;

	// Levinson's algorithm for solving 3x3 Toeplitz system (Equation 10)
	float r0 = expMoments.x;
	float r1 = expMoments.y;
	float r2 = expMoments.z;

	// First step
	float a1 = -r1 / r0;
	float p1 = 1.0 + a1 * a1;
	float q1 = a1;

	// Second step
	float numerator = -( r2 + r1 * q1 );
	float denominator = r0 * p1;
	float a2 = numerator / denominator;

	// Compute Lagrange multipliers
	return vec3(
		1.0 + a1 * q1 + a2 * r1,
		q1 + a1 + a2 * q1,
		a2
	);
}

// Evaluate reflectance at given phase using Lagrange polynomials
// Phase represents wavelength in circular space
// Returns reflectance guaranteed to be in [0, 1]
float evalReflectanceRealLagrange3( float phase, vec3 lagranges ) {
	// Conjugate circle point: e^(-i*phase)
	vec2 conjCirclePoint = vec2( cos( -phase ), sin( -phase ) );

	// Evaluate Lagrange series
	float lagrangeSeries = evalFourierSeriesReal3( conjCirclePoint, lagranges );

	// Convert to reflectance using arctangent (guarantees 0-1 range)
	return atan( lagrangeSeries ) / PI + 0.5;
}

// Convert wavelength to phase for Fourier representation
float wavelengthToPhase( float wavelength ) {
	float t = ( wavelength - MIN_WAVELENGTH ) / ( MAX_WAVELENGTH - MIN_WAVELENGTH );
	return t * 2.0 * PI;
}

// Convert wavelength to approximate RGB for visualization
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

// Convert RGB to Lagrange spectral coefficients
// This is the main function for material color conversion
vec3 rgbToSpectralCoefficients( vec3 rgb ) {
	// Step 1: Convert to Fourier coefficients
	vec3 fourier = srgbToFourier( rgb );

	// Step 2: Prepare Lagrange multipliers
	vec3 lagranges = prepReflectanceRealLagrangeBiased3( fourier );

	return lagranges;
}

// Evaluate reflectance at specific wavelength
float evalReflectanceAtWavelength( float wavelength, vec3 lagranges ) {
	float phase = wavelengthToPhase( wavelength );
	return evalReflectanceRealLagrange3( phase, lagranges );
}

// Convert spectral coefficients back to RGB by sampling spectrum
vec3 spectralCoefficientsToRGB( vec3 lagranges, int numSamples ) {
	vec3 rgb = vec3( 0.0 );

	for ( int i = 0; i < numSamples; i++ ) {
		float t = ( float( i ) + 0.5 ) / float( numSamples );
		float wavelength = MIN_WAVELENGTH + t * ( MAX_WAVELENGTH - MIN_WAVELENGTH );

		float reflectance = evalReflectanceAtWavelength( wavelength, lagranges );
		vec3 wrgb = wavelengthToRGB( wavelength );

		rgb += reflectance * wrgb;
	}

	// Normalize
	rgb /= float( numSamples );

	// Normalize to max of 1
	float maxVal = max( max( rgb.r, rgb.g ), max( rgb.b, 1.0 ) );
	rgb /= maxVal;

	return rgb;
}

`;
