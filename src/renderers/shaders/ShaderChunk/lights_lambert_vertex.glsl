vec3 diffuse = vec3( 1.0 );

GeometricContext geometry = GeometricContext( mvPosition.xyz, normalize( transformedNormal ), normalize( -mvPosition.xyz ) );
GeometricContext backGeometry = GeometricContext( geometry.position, -geometry.normal, geometry.viewDir );

ReflectedLight frontReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );
ReflectedLight backReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		IncidentLight directLight;

		getPointDirectLight( pointLights[ i ], geometry, directLight );

		BRDF_Lambert( directLight, geometry, diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED

			BRDF_Lambert( directLight, backGeometry, diffuse, backReflectedLight );

		#endif

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		IncidentLight directLight;

		getSpotDirectLight( spotLights[ i ], geometry, directLight );

		BRDF_Lambert( directLight, geometry, diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED

			BRDF_Lambert( directLight, backGeometry, diffuse, backReflectedLight );

		#endif

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		IncidentLight directLight;

		getDirectionalDirectLight( directionalLights[ i ], geometry, directLight );

		BRDF_Lambert( directLight, geometry, diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED

			BRDF_Lambert( directLight, backGeometry, diffuse, backReflectedLight );

		#endif

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		IncidentLight indirectLight;

		getHemisphereIndirectLight( hemisphereLights[ i ], geometry, indirectLight );

		BRDF_Lambert( indirectLight, geometry, diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED
	
			getHemisphereIndirectLight( hemisphereLights[ i ], backGeometry, indirectLight );

			BRDF_Lambert( indirectLight, backGeometry, diffuse, backReflectedLight );

		#endif

	}

#endif

vLightFront = ambientLightColor + frontReflectedLight.diffuse;

#ifdef DOUBLE_SIDED

	vLightBack = ambientLightColor + backReflectedLight.diffuse;

#endif