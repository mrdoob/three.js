vec3 viewDir = normalize( vViewPosition );

ReflectedLight reflectedLight;
reflectedLight.directSpecular = vec3( 0.0 );
reflectedLight.directDiffuse = vec3( 0.0 );
reflectedLight.indirectSpecular = vec3( 0.0 );
reflectedLight.indirectDiffuse = vec3( 0.0 );

vec3 diffuse = diffuseColor.rgb;

#ifdef METAL

	diffuse *= specular;

#endif

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		IncidentLight incidentLight;
		getPointLightDirect( pointLights[ i ], -vViewPosition, incidentLight );

		reflectedLight.directDiffuse +=
			BRDF_Lambert( incidentLight, normal, diffuse );

		reflectedLight.directSpecular +=
			BRDF_BlinnPhong( incidentLight, normal, viewDir, specular, shininess );

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		IncidentLight incidentLight;
		getSpotLightDirect( spotLights[ i ], -vViewPosition, incidentLight );

		reflectedLight.directDiffuse +=
			BRDF_Lambert( incidentLight, normal, diffuse );

		reflectedLight.directSpecular +=
			BRDF_BlinnPhong( incidentLight, normal, viewDir, specular, shininess );

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		IncidentLight incidentLight;
		getDirLightDirect( directionalLights[ i ], incidentLight );

		reflectedLight.directDiffuse +=
			BRDF_Lambert( incidentLight, normal, diffuse );

		reflectedLight.directSpecular +=
			BRDF_BlinnPhong( incidentLight, normal, viewDir, specular, shininess );

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		IncidentLight incidentLight;
		getHemisphereLightIndirect( hemisphereLights[ i ], normal, incidentLight );

		reflectedLight.indirectDiffuse +=
			BRDF_Lambert( incidentLight, normal, diffuse );

	}

#endif


outgoingLight +=
	reflectedLight.directSpecular +
	reflectedLight.directDiffuse +
	reflectedLight.indirectSpecular +
	reflectedLight.indirectDiffuse +
	totalEmissiveLight;
