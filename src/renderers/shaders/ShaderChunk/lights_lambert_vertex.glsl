vLightFront = vec3( 0.0 );

#ifdef DOUBLE_SIDED

	vLightBack = vec3( 0.0 );

#endif

vec3 normal = normalize( transformedNormal );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		vec3 lightDir, lightIntensity;
		getPointLight( pointLights[i], -vViewPosition, lightDir, lightIntensity );

		if( dot( lightIntensity, lightIntensity ) > 0.0 ) {

			float dotNL = dot( normal, lightDir );

			vLightFront += lightIntensity * saturate( dotNL );

			#ifdef DOUBLE_SIDED

				vLightBack += lightIntensity * saturate( - dotNL );

			#endif
		}

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		vec3 lightDir, lightIntensity;
		getSpotLight( spotLights[i], -vViewPosition, lightDir, lightIntensity );

		if( dot( lightIntensity, lightIntensity ) > 0.0 ) {

			float dotNL = saturate( dot( normal, lightDir ) );

			vLightFront += lightIntensity * saturate( dotNL );

			#ifdef DOUBLE_SIDED

				vLightBack += lightIntensity * saturate( - dotNL );

			#endif

		}

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		vec3 lightDir, lightIntensity;
		getDirLightDirect( directionalLights[i], lightDir, lightIntensity );

		if( dot( lightIntensity, lightIntensity ) > 0.0 ) {

			float dotNL = dot( normal, lightDir );

			vLightFront += lightIntensity * saturate( dotNL );

			#ifdef DOUBLE_SIDED

				vLightBack += lightIntensity * saturate( - dotNL );

			#endif

		}

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		vLightFront += getHemisphereLightIndirect( hemisphereLights[ i ], normal );

		#ifdef DOUBLE_SIDED
	
			vLightBack += getHemisphereLightIndirect( hemisphereLights[ i ], -normal );

		#endif

	}

#endif

vLightFront += ambientLightColor;

#ifdef DOUBLE_SIDED

	vLightBack += ambientLightColor;

#endif
