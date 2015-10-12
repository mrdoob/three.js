vec3 diffuse = vec3( 1.0 );

IncidentLight incidentLight;

GeometricContext geometry = GeometricContext( mvPosition.xyz, normalize( transformedNormal ), normalize( -mvPosition.xyz ) );
GeometricContext backGeometry = GeometricContext( geometry.position, -geometry.normal, geometry.viewDir );

ReflectedLight frontReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );
ReflectedLight backReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		getPointIncidentLight( pointLights[ i ], geometry, incidentLight );

		BRDF_Lambert( incidentLight, geometry, diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED

			BRDF_Lambert( incidentLight, backGeometry, diffuse, backReflectedLight );

		#endif

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		getSpotIncidentLight( spotLights[ i ], geometry, incidentLight );

		BRDF_Lambert( incidentLight, geometry, diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED

			BRDF_Lambert( incidentLight, backGeometry, diffuse, backReflectedLight );

		#endif

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		getDirIncidentLight( directionalLights[ i ], geometry, incidentLight );

		BRDF_Lambert( incidentLight, geometry, diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED

			BRDF_Lambert( incidentLight, backGeometry, diffuse, backReflectedLight );

		#endif

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		getHemisphereLightIndirect( hemisphereLights[ i ], geometry, incidentLight );

		BRDF_Lambert( incidentLight, geometry, diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED
	
			getHemisphereIncidentLight( hemisphereLights[ i ], backGeometry, incidentLight );

			BRDF_Lambert( incidentLight, backGeometry, diffuse, backReflectedLight );

		#endif

	}

#endif

vLightFront = ambientLightColor + frontReflectedLight.diffuse;

#ifdef DOUBLE_SIDED

	vLightBack = ambientLightColor + backReflectedLight.diffuse;

#endif