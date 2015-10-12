vec3 normal = normalize( transformedNormal );
vec3 backNormal = -normal;

vec3 diffuse = vec3( 1.0 );

IncidentLight incidentLight;
ReflectedLight frontReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );
ReflectedLight backReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );


#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		getPointIncidentLight( pointLights[ i ], mvPosition.xyz, incidentLight );

		BRDF_Lambert( incidentLight, normal, diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED

			BRDF_Lambert( incidentLight, backNormal, diffuse, backReflectedLight );

		#endif

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		getSpotIncidentLight( spotLights[ i ], mvPosition.xyz, incidentLight );

		BRDF_Lambert( incidentLight, normal, diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED

			BRDF_Lambert( incidentLight, backNormal, diffuse, backReflectedLight );

		#endif

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		getDirIncidentLight( directionalLights[ i ], incidentLight );

		BRDF_Lambert( incidentLight, normal, diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED

			BRDF_Lambert( incidentLight, backNormal, diffuse, backReflectedLight );

		#endif

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		getHemisphereLightIndirect( hemisphereLights[ i ], normal, incidentLight );

		BRDF_Lambert( incidentLight, normal, diffuse, frontReflectedLight );

		#ifdef DOUBLE_SIDED
	
			getHemisphereIncidentLight( hemisphereLights[ i ], backNormal, incidentLight );

			BRDF_Lambert( incidentLight, backNormal, diffuse, backReflectedLight );

		#endif

	}

#endif

vLightFront = ambientLightColor + frontReflectedLight.diffuse;

#ifdef DOUBLE_SIDED

	vLightBack = ambientLightColor + backReflectedLight.diffuse;

#endif