vec3 viewDir = normalize( vViewPosition );

ReflectedLight directReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );
ReflectedLight indirectReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );

vec3 diffuse = diffuseColor.rgb;

#ifdef METAL

	diffuse *= specular;

#endif

IncidentLight incidentLight;

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		getPointLightDirect( pointLights[ i ], -vViewPosition, incidentLight );

		directReflectedLight.diffuse +=
			BRDF_Lambert( incidentLight, normal, diffuse );

		directReflectedLight.specular +=
			BRDF_BlinnPhong( incidentLight, normal, viewDir, specular, shininess );

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		getSpotLightDirect( spotLights[ i ], -vViewPosition, incidentLight );

		directReflectedLight.diffuse +=
			BRDF_Lambert( incidentLight, normal, diffuse );

		directReflectedLight.specular +=
			BRDF_BlinnPhong( incidentLight, normal, viewDir, specular, shininess );

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		getDirLightDirect( directionalLights[ i ], incidentLight );

		directReflectedLight.diffuse +=
			BRDF_Lambert( incidentLight, normal, diffuse );

		directReflectedLight.specular +=
			BRDF_BlinnPhong( incidentLight, normal, viewDir, specular, shininess );

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		getHemisphereLightIndirect( hemisphereLights[ i ], normal, incidentLight );

		indirectReflectedLight.diffuse +=
			BRDF_Lambert( incidentLight, normal, diffuse );

	}

#endif


outgoingLight +=
	directReflectedLight.specular + directReflectedLight.diffuse +
	indirectReflectedLight.specular + indirectReflectedLight.diffuse +
	totalEmissiveLight;
