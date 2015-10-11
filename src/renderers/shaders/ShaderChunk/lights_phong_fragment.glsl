vec3 viewDir = normalize( vViewPosition );

vec3 totalDirectReflectedSpecular = vec3( 0.0 );
vec3 totalDirectReflectedDiffuse = vec3( 0.0 );
vec3 totalIndirectReflectedSpecular = vec3( 0.0 );
vec3 totalIndirectReflectedDiffuse = vec3( 0.0 );

vec3 diffuse = diffuseColor.rgb;

#ifdef METAL

	diffuse *= specular;

#endif

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		vec3 lightColor, lightDir;
		getPointLightDirect( pointLights[i], -vViewPosition, lightColor, lightDir );

		totalDirectReflectedDiffuse +=
			BRDF_Lambert( lightColor, lightDir, normal, diffuse );

		totalDirectReflectedSpecular +=
			BRDF_BlinnPhong( lightColor, lightDir, normal, viewDir, specular, shininess );

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		vec3 lightColor, lightDir;
		getSpotLightDirect( spotLights[i], -vViewPosition, lightColor, lightDir );

		totalDirectReflectedDiffuse +=
			BRDF_Lambert( lightColor, lightDir, normal, diffuse );

		totalDirectReflectedSpecular +=
			BRDF_BlinnPhong( lightColor, lightDir, normal, viewDir, specular, shininess );

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		vec3 lightColor, lightDir;
		getDirLightDirect( directionalLights[i], lightColor, lightDir );

		totalDirectReflectedDiffuse +=
			BRDF_Lambert( lightColor, lightDir, normal, diffuse );

		totalDirectReflectedSpecular +=
			BRDF_BlinnPhong( lightColor, lightDir, normal, viewDir, specular, shininess );

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		vec3 lightColor, lightDir;
		getHemisphereLightIndirect( hemisphereLights[ i ], normal, lightColor, lightDir );

		totalIndirectReflectedDiffuse +=
			BRDF_Lambert( lightColor, lightDir, normal, diffuse );

	}

#endif


outgoingLight +=
	totalDirectReflectedDiffuse +
	totalDirectReflectedSpecular +
	totalIndirectReflectedDiffuse +
	totalIndirectReflectedSpecular +
	totalEmissiveLight;
