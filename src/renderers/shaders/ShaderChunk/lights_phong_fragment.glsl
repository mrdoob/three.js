#ifndef FLAT_SHADED

	vec3 normal = normalize( vNormal );

	#ifdef DOUBLE_SIDED

		normal = normal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );

	#endif

#else

	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );

#endif

#ifdef USE_NORMALMAP

	normal = perturbNormal2Arb( -vViewPosition, normal );

#elif defined( USE_BUMPMAP )

	normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );

#endif

vec3 viewDir = normalize( vViewPosition );

vec3 totalDiffuseLight = vec3( 0.0 );
vec3 totalSpecularLight = vec3( 0.0 );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		vec3 lightColor = pointLightColor[ i ];

		vec3 lightPosition = pointLightPosition[ i ];
		vec4 lPosition = viewMatrix * vec4( lightPosition, 1.0 );
		vec3 lVector = lPosition.xyz + vViewPosition.xyz;
		vec3 lightDir = normalize( lVector );

		// attenuation

		float attenuation = calcLightAttenuation( length( lVector ), pointLightDistance[ i ], pointLightDecay[ i ] );

		// diffuse

		float cosineTerm = saturate( dot( normal, lightDir ) );

		totalDiffuseLight += lightColor * attenuation * cosineTerm;

		// specular

		vec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );

		totalSpecularLight += brdf * specularStrength * lightColor * attenuation * cosineTerm;


	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		vec3 lightColor = spotLightColor[ i ];

		vec3 lightPosition = spotLightPosition[ i ];
		vec4 lPosition = viewMatrix * vec4( lightPosition, 1.0 );
		vec3 lVector = lPosition.xyz + vViewPosition.xyz;
		vec3 lightDir = normalize( lVector );

		float spotEffect = dot( spotLightDirection[ i ], normalize( lightPosition - vWorldPosition ) );

		if ( spotEffect > spotLightAngleCos[ i ] ) {

			spotEffect = saturate( pow( saturate( spotEffect ), spotLightExponent[ i ] ) );

			// attenuation

			float attenuation = calcLightAttenuation( length( lVector ), spotLightDistance[ i ], spotLightDecay[ i ] );

			attenuation *= spotEffect;

			// diffuse

			float cosineTerm = saturate( dot( normal, lightDir ) );

			totalDiffuseLight += lightColor * attenuation * cosineTerm;

			// specular

			vec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );

			totalSpecularLight += brdf * specularStrength * lightColor * attenuation * cosineTerm;

		}

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		vec3 lightColor = directionalLightColor[ i ];

		vec3 lightDir = transformDirection( directionalLightDirection[ i ], viewMatrix );

		// diffuse

		float cosineTerm = saturate( dot( normal, lightDir ) );

		totalDiffuseLight += lightColor * cosineTerm;

		// specular

		vec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );

		totalSpecularLight += brdf * specularStrength * lightColor * cosineTerm;

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		vec3 lightDir = transformDirection( hemisphereLightDirection[ i ], viewMatrix );

		// diffuse

		float dotProduct = dot( normal, lightDir );

		float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;

		vec3 lightColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );

		totalDiffuseLight += lightColor;

		// specular (sky term only)

		vec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );

		totalSpecularLight += brdf * specularStrength * lightColor * max( dotProduct, 0.0 );

	}

#endif

#ifdef METAL

	outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) * specular + totalSpecularLight + totalEmissiveLight;

#else

	outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) + totalSpecularLight + totalEmissiveLight;

#endif
