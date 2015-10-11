vLightFront = vec3( 0.0 );

#ifdef DOUBLE_SIDED

	vLightBack = vec3( 0.0 );

#endif

vec3 normal = normalize( transformedNormal );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		vec3 lightDir, lightColor;
		getPointLightDirect( pointLights[i], mvPosition.xyz, lightDir, lightColor );

		vLightFront += BRDF_Lambert( lightColor, vec3( 1.0 ), normal, lightDir );

		#ifdef DOUBLE_SIDED

			vLightBack += BRDF_Lambert( lightColor, vec3( 1.0 ), -normal, lightDir );

		#endif

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		vec3 lightDir, lightIntensity;
		getSpotLightDirect( spotLights[i], mvPosition.xyz, lightDir, lightIntensity );

		vLightFront += BRDF_Lambert( lightColor, vec3( 1.0 ), normal, lightDir );

		#ifdef DOUBLE_SIDED

			vLightBack += BRDF_Lambert( lightColor, vec3( 1.0 ), -normal, lightDir );

		#endif

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		vec3 lightDir, lightIntensity;
		getDirLightDirect( directionalLights[i], lightDir, lightIntensity );

		vLightFront += BRDF_Lambert( lightColor, vec3( 1.0 ), normal, lightDir );

		#ifdef DOUBLE_SIDED

			vLightBack += BRDF_Lambert( lightColor, vec3( 1.0 ), -normal, lightDir );

		#endif

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		vLightFront += getHemisphereLightIndirect( hemisphereLights[ i ], normal ) * RECIPROCAL_PI;

		#ifdef DOUBLE_SIDED
	
			vLightBack += getHemisphereLightIndirect( hemisphereLights[ i ], -normal ) * RECIPROCAL_PI;

		#endif

	}

#endif

vLightFront += ambientLightColor;

#ifdef DOUBLE_SIDED

	vLightBack += ambientLightColor;

#endif
