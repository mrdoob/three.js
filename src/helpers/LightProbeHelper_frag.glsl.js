/**
 * @author WestLangley / http://github.com/WestLangley
 */

export default /* glsl */`

#define RECIPROCAL_PI 0.318309886

vec3 inverseTransformDirection( in vec3 normal, in mat4 matrix ) {

	// matrix is assumed to be orthogonal

	return normalize( ( vec4( normal, 0.0 ) * matrix ).xyz );

}

vec3 linearToOutput( in vec3 a ) {

	#ifdef GAMMA_OUTPUT

		return pow( a, vec3( 1.0 / float( GAMMA_FACTOR ) ) );

	#else

		return a;

	#endif

}

// get the irradiance (radiance convolved with cosine lobe) at the point 'normal' on the unit sphere
// source: https://graphics.stanford.edu/papers/envmap/envmap.pdf

vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {

	// normal is assumed to have unit length

	float x = normal.x, y = normal.y, z = normal.z;

	// band 0
	vec3 result = shCoefficients[ 0 ] * 0.886227;

	// band 1
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;

	// band 2
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );

	return result;

}

uniform vec3 sh[ 9 ]; // sh coefficients

uniform float intensity; // light probe intensity

varying vec3 vNormal;

void main() {

	vec3 normal = normalize( vNormal );

	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

	vec3 irradiance = shGetIrradianceAt( worldNormal, sh );

	vec3 outgoingLight = RECIPROCAL_PI * irradiance * intensity;

	outgoingLight = linearToOutput( outgoingLight );

	gl_FragColor = vec4( outgoingLight, 1.0 );

}
`;
