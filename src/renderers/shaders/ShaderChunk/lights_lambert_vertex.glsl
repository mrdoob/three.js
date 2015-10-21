vec3 diffuse = vec3( 1.0 );

GeometricContext geometry = GeometricContext( mvPosition.xyz, normalize( transformedNormal ), normalize( -mvPosition.xyz ) );
GeometricContext backGeometry = GeometricContext( geometry.position, -geometry.normal, geometry.viewDir );

ReflectedLight frontReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );
ReflectedLight backReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		IncidentLight directLight = getPointDirectLight( pointLights[ i ], geometry );

		float dotNL = dot( geometry.normal, directLight.direction );
		frontReflectedLight.diffuse += dotNL * directLight.color * BRDF_Diffuse_Lambert( directLight, geometry, diffuse );

		#ifdef DOUBLE_SIDED

			float dotNLBack = dot( -geometry.normal, directLight.direction );
			backReflectedLight.diffuse += dotNLBack * directLight.color * BRDF_Diffuse_Lambert( directLight, backGeometry, diffuse );

		#endif

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		IncidentLight directLight = getSpotDirectLight( spotLights[ i ], geometry );

		float dotNL = dot( geometry.normal, directLight.direction );
		frontReflectedLight.diffuse += dotNL * directLight.color * BRDF_Diffuse_Lambert( directLight, geometry, diffuse );

		#ifdef DOUBLE_SIDED

			float dotNLBack = dot( -geometry.normal, directLight.direction );
			backReflectedLight.diffuse += dotNLBack * directLight.color * BRDF_Diffuse_Lambert( directLight, backGeometry, diffuse );

		#endif
	}

#endif

#if MAX_DIR_LIGHTS > 0

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		IncidentLight directLight = getDirectionalDirectLight( directionalLights[ i ], geometry );

		float dotNL = dot( geometry.normal, directLight.direction );
		frontReflectedLight.diffuse += dotNL * directLight.color * BRDF_Diffuse_Lambert( directLight, geometry, diffuse );

		#ifdef DOUBLE_SIDED

			float dotNLBack = dot( -geometry.normal, directLight.direction );
			backReflectedLight.diffuse += dotNLBack * directLight.color * BRDF_Diffuse_Lambert( directLight, backGeometry, diffuse );

		#endif

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		IncidentLight indirectLight = getHemisphereIndirectLight( hemisphereLights[ i ], geometry );

		float dotNL = dot( geometry.normal, directLight.direction );
		frontReflectedLight.diffuse += dotNL * directLight.color * BRDF_Diffuse_Lambert( directLight, geometry, diffuse );

		#ifdef DOUBLE_SIDED
	
			indirectLight = getHemisphereIndirectLight( hemisphereLights[ i ], backGeometry );

			float dotNLBack = dot( -geometry.normal, directLight.direction );
			backReflectedLight.diffuse += dotNLBack * directLight.color * BRDF_Diffuse_Lambert( directLight, backGeometry, diffuse );

		#endif

	}

#endif

vLightFront = frontReflectedLight.diffuse;

#ifdef DOUBLE_SIDED

	vLightBack = backReflectedLight.diffuse;

#endif