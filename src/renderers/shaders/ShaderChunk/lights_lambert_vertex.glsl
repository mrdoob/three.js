vLightFront = vec3( 0.0 );

#ifdef DOUBLE_SIDED

	vLightBack = vec3( 0.0 );

#endif

vec3 normal = normalize( transformedNormal );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		vec3 lightColor = pointLightColor[ i ];

		vec3 lVector = pointLightPosition[ i ] - mvPosition.xyz;
		vec3 lightDir = normalize( lVector );

		// attenuation

		float attenuation = calcLightAttenuation( length( lVector ), pointLightDistance[ i ], pointLightDecay[ i ] );

		// diffuse

		float dotProduct = dot( normal, lightDir );

		vLightFront += lightColor * attenuation * saturate( dotProduct );

		#ifdef DOUBLE_SIDED

			vLightBack += lightColor * attenuation * saturate( - dotProduct );

		#endif

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		vec3 lightColor = spotLightColor[ i ];

		vec3 lightPosition = spotLightPosition[ i ];
		vec3 lVector = lightPosition - mvPosition.xyz;
		vec3 lightDir = normalize( lVector );

		float spotEffect = dot( spotLightDirection[ i ], lightDir );

		if ( spotEffect > spotLightAngleCos[ i ] ) {

			spotEffect = saturate( pow( saturate( spotEffect ), spotLightExponent[ i ] ) );

			// attenuation

			float attenuation = calcLightAttenuation( length( lVector ), spotLightDistance[ i ], spotLightDecay[ i ] );

			attenuation *= spotEffect;

			// diffuse

			float dotProduct = dot( normal, lightDir );

			vLightFront += lightColor * attenuation * saturate( dotProduct );

			#ifdef DOUBLE_SIDED

				vLightBack += lightColor * attenuation * saturate( - dotProduct );

			#endif

		}

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		vec3 lightColor = directionalLightColor[ i ];

		vec3 lightDir = directionalLightDirection[ i ];

		// diffuse

		float dotProduct = dot( normal, lightDir );

		vLightFront += lightColor * saturate( dotProduct );

		#ifdef DOUBLE_SIDED

			vLightBack += lightColor * saturate( - dotProduct );

		#endif

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		vec3 lightDir = hemisphereLightDirection[ i ];

		// diffuse

		float dotProduct = dot( normal, lightDir );

		float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;

		vLightFront += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );

		#ifdef DOUBLE_SIDED

			float hemiDiffuseWeightBack = - 0.5 * dotProduct + 0.5;

			vLightBack += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeightBack );

		#endif

	}

#endif

vLightFront += ambientLightColor;

#ifdef DOUBLE_SIDED

	vLightBack += ambientLightColor;

#endif
