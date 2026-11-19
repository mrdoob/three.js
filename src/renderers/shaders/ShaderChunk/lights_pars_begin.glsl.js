export default /* glsl */`
uniform bool receiveShadow;
uniform vec3 ambientLightColor;

#if defined( USE_LIGHT_PROBES )

	uniform vec3 lightProbe[ 9 ];

#endif

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

vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {

	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );

	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );

	return irradiance;

}

vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {

	vec3 irradiance = ambientLightColor;

	return irradiance;

}

float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {

	// based upon Frostbite 3 Moving to Physically-based Rendering
	// page 32, equation 26: E[window1]
	// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );

	if ( cutoffDistance > 0.0 ) {

		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );

	}

	return distanceFalloff;

}

float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {

	return smoothstep( coneCosine, penumbraCosine, angleCosine );

}

#if NUM_SUN_LIGHTS > 0

	struct SunLight {
		vec3 direction;
		vec3 color;
	};

	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];

	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {

		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;

	}

#endif


#if NUM_DIR_LIGHTS > 0

	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};

	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {

		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;

	}

#endif


#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

	// light is an out parameter as having it as a return value caused compiler errors on some devices
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {

		vec3 lVector = pointLight.position - geometryPosition;

		light.direction = normalize( lVector );

		float lightDistance = length( lVector );

		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );

	}

#endif


#if NUM_SPOT_LIGHTS > 0

	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};

	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];

	// light is an out parameter as having it as a return value caused compiler errors on some devices
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {

		vec3 lVector = spotLight.position - geometryPosition;

		light.direction = normalize( lVector );

		float angleCos = dot( light.direction, spotLight.direction );

		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );

		if ( spotAttenuation > 0.0 ) {

			float lightDistance = length( lVector );

			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );

		} else {

			light.color = vec3( 0.0 );
			light.visible = false;

		}

	}

#endif


#if NUM_RECT_AREA_LIGHTS > 0

	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};

	// Pre-computed values of LinearTransformedCosine approximation of BRDF
	// BRDF approximation Texture is 64x64
	uniform sampler2D ltc_1; // RGBA Float
	uniform sampler2D ltc_2; // RGBA Float

	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];

#endif


#if NUM_HEMI_LIGHTS > 0

	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};

	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];

	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {

		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;

		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );

		return irradiance;

	}

	vec3 getHemisphereLightRadiance( const in HemisphereLight hemiLight, const in vec3 radianceVec, const in vec3 normal, const in float roughness ) {

		// GGX prefiltering of a sharp sky/ground horizon: Student-t marginal at low roughness, cosine irradiance at roughness = 1
		float alpha = pow2( roughness );
		float t = 2.0 * alpha / ( 1.0 + alpha );
		float dotRL = dot( radianceVec, hemiLight.direction );

		// Box filtered over the pixel footprint, so the horizon doesn't alias on smooth surfaces
		float pixelHalfWidth = 0.5 * length( vec2( dFdx( dotRL ), dFdy( dotRL ) ) );
		float lobeWidth2 = pow2( t ) * ( 1.0 - pow2( dotRL ) );
		float skyWeight = saturate( dotRL / max( sqrt( pow2( dotRL + pixelHalfWidth ) + lobeWidth2 ) + sqrt( pow2( dotRL - pixelHalfWidth ) + lobeWidth2 ), 2e-4 ) + 0.5 );

		// The lobe is a cosine lobe stretched by t: remove the sky it reaches behind the surface (Lambert's polygon formula) and renormalize
		vec3 skyAxis = normalize( t * hemiLight.direction + ( 1.0 - t ) * dotRL * radianceVec );
		vec3 behindAxis = - normalize( t * normal + ( 1.0 - t ) * dot( radianceVec, normal ) * radianceVec );
		float a = dot( skyAxis, radianceVec );
		float b = dot( behindAxis, radianceVec );
		float ab = dot( skyAxis, behindAxis );
		float det = max( abs( dot( radianceVec, cross( skyAxis, behindAxis ) ) ), 1e-4 );
		float skyFraction = 0.5 * a + 0.5;
		float behindFraction = 0.5 * b + 0.5;
		float behindSky = ( atan( det, a * b - ab ) + a * atan( det, ab * a - b ) + b * atan( det, ab * b - a ) ) * RECIPROCAL_PI * 0.5;

		// The bounds keep nearly collinear axes exact, like floors, ceilings and roughness = 1
		behindSky = clamp( behindSky, max( skyFraction + behindFraction - 1.0, 0.0 ), min( skyFraction, behindFraction ) );

		float hemiSpecularWeight = saturate( ( skyWeight - behindSky ) / max( 1.0 - behindFraction, 1e-4 ) );

		return mix( hemiLight.groundColor, hemiLight.skyColor, hemiSpecularWeight ) * RECIPROCAL_PI;

	}

#endif

// Physical materials reflect ambient and hemisphere lights as a distant environment, looked up like getIBLRadiance()
vec3 getIndirectLightRadiance( const in vec3 lookupVec, const in vec3 lookupNormal, const in vec3 normal, const in float roughness ) {

	// A uniform environment reflects its irradiance / PI at any roughness
	vec3 radiance = getAmbientLightIrradiance( ambientLightColor ) * RECIPROCAL_PI;

	#if ( NUM_HEMI_LIGHTS > 0 )

		// Mixing the lookup with the normal is more accurate for rough objects, see getIBLRadiance()
		vec3 radianceVec = normalize( mix( lookupVec, lookupNormal, pow4( roughness ) ) );

		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

			radiance += getHemisphereLightRadiance( hemisphereLights[ i ], radianceVec, normal, roughness );

		}
		#pragma unroll_loop_end

	#endif

	return radiance;

}

#include <lightprobes_pars_fragment>
`;
