vLightFront = vec3( 0.0 );

#ifdef DOUBLE_SIDED

	vLightBack = vec3( 0.0 );

#endif

vec3 normal = normalize( transformedNormal );
vec3 diffuse = vec3( 1.0 );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		vec3 lightColor, lightDir;
		getPointLightDirect( pointLights[i], mvPosition.xyz, lightColor, lightDir );

		vLightFront += BRDF_Lambert( lightColor, lightDir, normal, diffuse );

		#ifdef DOUBLE_SIDED

			vLightBack += BRDF_Lambert( lightColor, lightDir, -normal, diffuse );

		#endif

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		vec3 lightColor, lightDir;
		getSpotLightDirect( spotLights[i], mvPosition.xyz, lightColor, lightDir );

		vLightFront += BRDF_Lambert( lightColor, lightDir, normal, diffuse );

		#ifdef DOUBLE_SIDED

			vLightBack += BRDF_Lambert( lightColor, lightDir, -normal, diffuse );

		#endif

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		vec3 lightColor, lightDir;
		getDirLightDirect( directionalLights[i], lightColor, lightDir );

		vLightFront += BRDF_Lambert( lightColor, lightDir, normal, diffuse );

		#ifdef DOUBLE_SIDED

			vLightBack += BRDF_Lambert( lightColor, lightDir, -normal, diffuse );

		#endif

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		vec3 lightColor, lightDir;
		getHemisphereLightIndirect( hemisphereLights[ i ], normal, lightColor, lightDir );

		vLightFront += BRDF_Lambert( lightColor, lightDir, normal, diffuse );

		#ifdef DOUBLE_SIDED
	
			getHemisphereLightIndirect( hemisphereLights[ i ], -normal, lightColor, lightDir );

			vLightBack += BRDF_Lambert( lightColor, lightDir, -normal, diffuse );

		#endif

	}

#endif

vLightFront += ambientLightColor;

#ifdef DOUBLE_SIDED

	vLightBack += ambientLightColor;

#endif
