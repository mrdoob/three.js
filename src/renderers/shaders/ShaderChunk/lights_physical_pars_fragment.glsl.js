export default /* glsl */`
struct PhysicalMaterial {

	vec3	diffuseColor;
	float	specularRoughness;
	vec3	specularColor;

	#ifndef STANDARD
		float clearCoat;
		float clearCoatRoughness;
	#endif

};

#define MAXIMUM_SPECULAR_COEFFICIENT 0.16
#define DEFAULT_SPECULAR_COEFFICIENT 0.04

// Clear coat directional hemishperical reflectance (this approximation should be improved)
float clearCoatDHRApprox( const in float roughness, const in float dotNL ) {

	return DEFAULT_SPECULAR_COEFFICIENT + ( 1.0 - DEFAULT_SPECULAR_COEFFICIENT ) * ( pow( 1.0 - dotNL, 5.0 ) * pow( 1.0 - roughness, 2.0 ) );

}

#if NUM_RECT_AREA_LIGHTS > 0

	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

		vec3 normal = geometry.normal;
		vec3 viewDir = geometry.viewDir;
		vec3 position = geometry.position;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.specularRoughness;

		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight; // counterclockwise; light shines in local neg z direction
		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;

		vec2 uv = LTC_Uv( normal, viewDir, roughness );

		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );

		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);

		// LTC Fresnel Approximation by Stephen Hill
		// http://blog.selfshadow.com/publications/s2016-advances/s2016_ltc_fresnel.pdf
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );

		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );

		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );

	}

#endif

void RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
 
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;

	#ifndef PHYSICALLY_CORRECT_LIGHTS

		irradiance *= PI; // punctual light

	#endif

	#ifndef STANDARD
		#ifdef USE_CLEARCOAT_NORMALMAP
			float ccDotNL = saturate( dot( geometry.clearCoatNormal, directLight.direction ) );
			vec3 ccIrradiance = ccDotNL * directLight.color;

			#ifndef PHYSICALLY_CORRECT_LIGHTS

				ccIrradiance *= PI; // punctual light

			#endif
		#endif
	#endif

	#ifndef STANDARD
		#ifdef USE_CLEARCOAT_NORMALMAP
			float clearCoatDHR = material.clearCoat * clearCoatDHRApprox( material.clearCoatRoughness, ccDotNL );
		#else
			float clearCoatDHR = material.clearCoat * clearCoatDHRApprox( material.clearCoatRoughness, dotNL );
		#endif
	#else
		float clearCoatDHR = 0.0;
	#endif

	reflectedLight.directSpecular += ( 1.0 - clearCoatDHR ) * irradiance * BRDF_Specular_GGX( directLight, geometry.viewDir, geometry.normal, material.specularColor, material.specularRoughness );

	reflectedLight.directDiffuse += ( 1.0 - clearCoatDHR ) * irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );

	#ifndef STANDARD
		#ifdef USE_CLEARCOAT_NORMALMAP
			reflectedLight.directSpecular += ccIrradiance * material.clearCoat * BRDF_Specular_GGX( directLight, geometry.viewDir, geometry.clearCoatNormal, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearCoatRoughness );
		#else
			reflectedLight.directSpecular += irradiance * material.clearCoat * BRDF_Specular_GGX( directLight, geometry.viewDir, geometry.normal, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearCoatRoughness );
		#endif
	#endif

}

void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	// Defer to the IndirectSpecular function to compute
	// the indirectDiffuse if energy preservation is enabled.
	#ifndef ENVMAP_TYPE_CUBE_UV

		reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );

	#endif

}

void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearCoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {

	#ifndef STANDARD
		#ifdef USE_CLEARCOAT_NORMALMAP
			float ccDotNV = saturate( dot( geometry.clearCoatNormal, geometry.viewDir ) );
		#else
			float ccDotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
		#endif
		float ccDotNL = ccDotNV;
		float clearCoatDHR = material.clearCoat * clearCoatDHRApprox( material.clearCoatRoughness, ccDotNL );
	#else
		float clearCoatDHR = 0.0;
	#endif

	float clearCoatInv = 1.0 - clearCoatDHR;

	// Both indirect specular and diffuse light accumulate here
	// if energy preservation enabled, and PMREM provided.
	#if defined( ENVMAP_TYPE_CUBE_UV )

		vec3 singleScattering = vec3( 0.0 );
		vec3 multiScattering = vec3( 0.0 );
		vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;

		BRDF_Specular_Multiscattering_Environment( geometry, material.specularColor, material.specularRoughness, singleScattering, multiScattering );

		vec3 diffuse = material.diffuseColor * ( 1.0 - ( singleScattering + multiScattering ) );

		reflectedLight.indirectSpecular += clearCoatInv * radiance * singleScattering;
		reflectedLight.indirectDiffuse += multiScattering * cosineWeightedIrradiance;
		reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;

	#else

		reflectedLight.indirectSpecular += clearCoatInv * radiance * BRDF_Specular_GGX_Environment( geometry.viewDir, geometry.normal, material.specularColor, material.specularRoughness );

	#endif

	#ifndef STANDARD
		#ifdef USE_CLEARCOAT_NORMALMAP
			reflectedLight.indirectSpecular += clearCoatRadiance * material.clearCoat * BRDF_Specular_GGX_Environment( geometry.viewDir, geometry.clearCoatNormal, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearCoatRoughness );
		#else
			reflectedLight.indirectSpecular += clearCoatRadiance * material.clearCoat * BRDF_Specular_GGX_Environment( geometry.viewDir, geometry.normal, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearCoatRoughness );
		#endif
	#endif
}

#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical

#define Material_BlinnShininessExponent( material )   GGXRoughnessToBlinnExponent( material.specularRoughness )
#define Material_ClearCoat_BlinnShininessExponent( material )   GGXRoughnessToBlinnExponent( material.clearCoatRoughness )

// ref: https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {

	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );

}
`;
