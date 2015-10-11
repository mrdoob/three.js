vec3 viewDir = normalize( vViewPosition );

vec3 totalReflectedLight = vec3( 0.0 );

vec3 diffuse = diffuseColor.rgb;

#ifdef METAL

	diffuse *= specular;

#endif

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		vec3 lightDir, lightColor;
		getPointLightDirect( pointLights[i], -vViewPosition, lightDir, lightColor );

		totalReflectedLight +=
			BRDF_Lambert( lightColor, diffuse, normal, lightDir ) +
			BRDF_BlinnPhong( lightColor, specular, shininess, normal, lightDir, viewDir );

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		vec3 lightDir, lightColor;
		getSpotLightDirect( spotLights[i], -vViewPosition, lightDir, lightColor );

		totalReflectedLight +=
			BRDF_Lambert( lightColor, diffuse, normal, lightDir ) +
			BRDF_BlinnPhong( lightColor, specular, shininess, normal, lightDir, viewDir );

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		vec3 lightDir, lightIntensity;
		getDirLightDirect( directionalLights[i], lightDir, lightIntensity );

		totalReflectedLight +=
			BRDF_Lambert( lightColor, diffuse, normal, lightDir ) +
			BRDF_BlinnPhong( lightColor, specular, shininess, normal, lightDir, viewDir );

	}

#endif

outgoingLight += totalReflectedLight + totalEmissiveLight;
