vec3 viewDir = normalize( vViewPosition );

vec3 totalDiffuseLight = vec3( 0.0 );
vec3 totalSpecularLight = vec3( 0.0 );


// roughness linear remapping

roughnessFactor = roughnessFactor * 0.5 + 0.5; // disney's remapping of [ 0, 1 ] roughness to [ 0.5, 1 ]


// metalness effect on color

vec3 specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );

diffuseColor.rgb *= ( 1.0 - metalnessFactor );


#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		vec3 lightColor = pointLightColor[ i ];

		vec3 lightPosition = pointLightPosition[ i ];
		vec3 lVector = lightPosition + vViewPosition.xyz;
		vec3 lightDir = normalize( lVector );

		// attenuation

		float attenuation = calcLightAttenuation( length( lVector ), pointLightDistance[ i ], pointLightDecay[ i ] );

		// diffuse

		float cosineTerm = saturate( dot( normal, lightDir ) );

		totalDiffuseLight += lightColor * attenuation * cosineTerm;

		// specular

    	vec3 brdf = BRDF_GGX( specularColor, roughnessFactor, normal, lightDir, viewDir );

		totalSpecularLight += brdf * specularStrength * lightColor * attenuation * cosineTerm;


	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		vec3 lightColor = spotLightColor[ i ];

		vec3 lightPosition = spotLightPosition[ i ];
		vec3 lVector = lightPosition + vViewPosition.xyz;
		vec3 lightDir = normalize( lVector );

		float spotEffect = dot( spotLightDirection[ i ], lightDir );

		if ( spotEffect > spotLightAngleCos[ i ] ) {

			spotEffect = saturate( pow( saturate( spotEffect ), spotLightExponent[ i ] ) );

			// attenuation

			float attenuation = calcLightAttenuation( length( lVector ), spotLightDistance[ i ], spotLightDecay[ i ] );

			attenuation *= spotEffect;

			// diffuse

			float cosineTerm = saturate( dot( normal, lightDir ) );

			totalDiffuseLight += lightColor * attenuation * cosineTerm;

			// specular

    		vec3 brdf = BRDF_GGX( specularColor, roughnessFactor, normal, lightDir, viewDir );

			totalSpecularLight += brdf * specularStrength * lightColor * attenuation * cosineTerm;

		}

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		vec3 lightColor = directionalLightColor[ i ];

		vec3 lightDir = directionalLightDirection[ i ];

		// diffuse

		float cosineTerm = saturate( dot( normal, lightDir ) );

		totalDiffuseLight += lightColor * cosineTerm;

		// specular

    	vec3 brdf = BRDF_GGX( specularColor, roughnessFactor, normal, lightDir, viewDir );

		totalSpecularLight += brdf * specularStrength * lightColor * cosineTerm;

	}

#endif
