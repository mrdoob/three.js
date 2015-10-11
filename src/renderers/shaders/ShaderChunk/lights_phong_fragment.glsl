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

		IncidentLight incidentLight;
		getPointLightDirect( pointLights[ i ], -vViewPosition, incidentLight );

		totalDirectReflectedDiffuse +=
			BRDF_Lambert( incidentLight, normal, diffuse );

		totalDirectReflectedSpecular +=
			BRDF_BlinnPhong( incidentLight, normal, viewDir, specular, shininess );

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		IncidentLight incidentLight;
		getSpotLightDirect( spotLights[ i ], -vViewPosition, incidentLight );

		totalDirectReflectedDiffuse +=
			BRDF_Lambert( incidentLight, normal, diffuse );

		totalDirectReflectedSpecular +=
			BRDF_BlinnPhong( incidentLight, normal, viewDir, specular, shininess );

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		IncidentLight incidentLight;
		getDirLightDirect( directionalLights[ i ], incidentLight );

		totalDirectReflectedDiffuse +=
			BRDF_Lambert( incidentLight, normal, diffuse );

		totalDirectReflectedSpecular +=
			BRDF_BlinnPhong( incidentLight, normal, viewDir, specular, shininess );

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		IncidentLight incidentLight;
		getHemisphereLightIndirect( hemisphereLights[ i ], normal, incidentLight );

		totalIndirectReflectedDiffuse +=
			BRDF_Lambert( incidentLight, normal, diffuse );

	}

#endif


outgoingLight +=
	totalDirectReflectedDiffuse +
	totalDirectReflectedSpecular +
	totalIndirectReflectedDiffuse +
	totalIndirectReflectedSpecular +
	totalEmissiveLight;
