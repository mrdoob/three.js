vec3 viewDir = normalize( -mvPosition.xyz );
vec3 normal = normalize( transformedNormal );

vec3 diffuse = vec3( 1.0 );

IncidentLight incidentLight;
ReflectedLight frontReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );
ReflectedLight backReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );

GeometricContext geometricContext = GeometricContext( mvPosition.xyz, normal, viewDir );
GeometricContext backGeometricContext = GeometricContext( mvPosition.xyz, -normal, viewDir );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		getPointIncidentLight( pointLights[ i ], geometricContext, incidentLight );

		BRDF_Lambert( incidentLight, geometricContext, diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED

			BRDF_Lambert( incidentLight, backGeometricContext, diffuse, backReflectedLight );

		#endif

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		getSpotIncidentLight( spotLights[ i ], geometricContext, incidentLight );

		BRDF_Lambert( incidentLight, geometricContext, diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED

			BRDF_Lambert( incidentLight, backGeometricContext, diffuse, backReflectedLight );

		#endif

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		getDirIncidentLight( directionalLights[ i ], geometricContext, incidentLight );

		BRDF_Lambert( incidentLight, geometricContext, diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED

			BRDF_Lambert( incidentLight, backGeometricContext, diffuse, backReflectedLight );

		#endif

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		getHemisphereLightIndirect( hemisphereLights[ i ], geometricContext, , incidentLight );

		BRDF_Lambert( incidentLight, geometricContext, , diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED
	
			getHemisphereIncidentLight( hemisphereLights[ i ], backGeometricContext, incidentLight );

			BRDF_Lambert( incidentLight, backGeometricContext, diffuse, backReflectedLight );

		#endif

	}

#endif

vLightFront = ambientLightColor + frontReflectedLight.diffuse;

#ifdef DOUBLE_SIDED

	vLightBack = ambientLightColor + backReflectedLight.diffuse;

#endif