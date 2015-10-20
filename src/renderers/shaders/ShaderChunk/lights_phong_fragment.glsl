vec3 diffuse = diffuseColor.rgb;

#ifdef METAL

	diffuse = vec3( 0.0 );

#endif

#if defined( ENERGY_PRESERVING_RGB )

	diffuse *= whiteCompliment( specular );

#elif defined( ENERGY_PRESERVING_MONOCHROME )

	diffuse *= whiteCompliment( luminance( specular ) );

#endif

GeometricContext geometry = GeometricContext( -vViewPosition, normal, normalize(vViewPosition ) );

ReflectedLight directReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );
ReflectedLight indirectReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		IncidentLight directLight;

		getPointDirectLight( pointLights[ i ], geometry, directLight );

		BRDF_Lambert( directLight, geometry, diffuse, directReflectedLight );
		//BRDF_OrenNayar( directLight, geometry, diffuse, 0.5, directReflectedLight );

		BRDF_BlinnPhong( directLight, geometry, specular, shininess, directReflectedLight );

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		IncidentLight directLight;

		getSpotDirectLight( spotLights[ i ], geometry, directLight );

		BRDF_Lambert( directLight, geometry, diffuse, directReflectedLight );
		//BRDF_OrenNayar( directLight, geometry, diffuse, 0.5, directReflectedLight );

		BRDF_BlinnPhong( directLight, geometry, specular, shininess, directReflectedLight );

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		IncidentLight directLight;

		getDirectionalDirectLight( directionalLights[ i ], geometry, directLight );

		BRDF_Lambert( directLight, geometry, diffuse, directReflectedLight );
		//BRDF_OrenNayar( directLight, geometry, diffuse, 0.5, directReflectedLight );

		BRDF_BlinnPhong( directLight, geometry, specular, shininess, directReflectedLight );

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		IncidentLight indirectLight;

		getHemisphereIndirectLight( hemisphereLights[ i ], geometry, indirectLight );

		BRDF_Lambert( indirectLight, geometry, diffuse, indirectReflectedLight );
		//BRDF_OrenNayar( indirectLight, geometry, diffuse, 0.5, indirectReflectedLight );

	}

#endif