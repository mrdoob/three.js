vLightFront = vec3( 0.0 );

#ifdef DOUBLE_SIDED

	vLightBack = vec3( 0.0 );

#endif

vec3 normal = normalize( transformedNormal );
vec3 diffuse = vec3( 1.0 );


#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		IncidentLight incidentLight;
		getPointLightDirect( pointLights[ i ], mvPosition.xyz, incidentLight );

		vLightFront += BRDF_Lambert( incidentLight, normal, diffuse );

		#ifdef DOUBLE_SIDED

			vLightBack += BRDF_Lambert( incidentLight, -normal, diffuse );

		#endif

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		IncidentLight incidentLight;
		getSpotLightDirect( spotLights[ i ], mvPosition.xyz, incidentLight );

		vLightFront += BRDF_Lambert( incidentLight, normal, diffuse );

		#ifdef DOUBLE_SIDED

			vLightBack += BRDF_Lambert( incidentLight, -normal, diffuse );

		#endif

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		IncidentLight incidentLight;
		getDirLightDirect( directionalLights[ i ], incidentLight );

		vLightFront += BRDF_Lambert( incidentLight, normal, diffuse );

		#ifdef DOUBLE_SIDED

			vLightBack += BRDF_Lambert( incidentLight, -normal, diffuse );

		#endif

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		IncidentLight incidentLight;
		getHemisphereLightIndirect( hemisphereLights[ i ], normal, incidentLight );

		vLightFront += BRDF_Lambert( incidentLight, normal, diffuse );

		#ifdef DOUBLE_SIDED
	
			incidentLight = getHemisphereLightIndirect( hemisphereLights[ i ], -normal );

			vLightBack += BRDF_Lambert( incidentLight, -normal, diffuse );

		#endif

	}

#endif

vLightFront += ambientLightColor;

#ifdef DOUBLE_SIDED

	vLightBack += ambientLightColor;

#endif
