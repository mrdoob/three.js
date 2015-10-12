vec3 diffuse = diffuseColor.rgb;

#ifdef METAL

	diffuse = vec3( 0.0 );

#endif

#if defined( ENERGY_PRESERVING_RGB )

	diffuse *= whiteCompliment( specular );

#elif defined( ENERGY_PRESERVING_MONOCHROME )

	diffuse *= whiteCompliment( luminance( specular ) );

#endif

IncidentLight incidentLight;

GeometricContext geometry = GeometricContext( -vViewPosition, normal, normalize(vViewPosition ) );

ReflectedLight directReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );
ReflectedLight indirectReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		getPointIncidentLight( pointLights[ i ], geometry, incidentLight );

		BRDF_Lambert( incidentLight, geometry, diffuse, directReflectedLight );
		//BRDF_OrenNayar( incidentLight, geometry, diffuse, 0.5, directReflectedLight );

		BRDF_BlinnPhong( incidentLight, geometry, specular, shininess, directReflectedLight );

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		getSpotIncidentLight( spotLights[ i ], geometry, incidentLight );

		BRDF_Lambert( incidentLight, geometry, diffuse, directReflectedLight );
		//BRDF_OrenNayar( incidentLight, geometry, diffuse, 0.5, directReflectedLight );

		BRDF_BlinnPhong( incidentLight, geometry, specular, shininess, directReflectedLight );

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		getDirIncidentLight( directionalLights[ i ], geometry, incidentLight );

		BRDF_Lambert( incidentLight, geometry, diffuse, directReflectedLight );
		//BRDF_OrenNayar( incidentLight, geometry, diffuse, 0.5, directReflectedLight );

		BRDF_BlinnPhong( incidentLight, geometry, specular, shininess, directReflectedLight );

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		getHemisphereIncidentLight( hemisphereLights[ i ], geometry, incidentLight );

		BRDF_Lambert( incidentLight, geometry, diffuse, indirectReflectedLight );
		//BRDF_OrenNayar( incidentLight, geometry, diffuse, 0.5, indirectReflectedLight );

	}

#endif


outgoingLight +=
	directReflectedLight.specular + directReflectedLight.diffuse +
	indirectReflectedLight.specular + indirectReflectedLight.diffuse +
	totalEmissiveLight;
