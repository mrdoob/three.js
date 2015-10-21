vec3 diffuse = vec3( 1.0 );

GeometricContext geometry = GeometricContext( mvPosition.xyz, normalize( transformedNormal ), normalize( -mvPosition.xyz ) );
GeometricContext backGeometry = GeometricContext( geometry.position, -geometry.normal, geometry.viewDir );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		IncidentLight directLight = getPointDirectLight( pointLights[ i ], geometry );

		float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
		vLightFront += dotNL * directLight.color * BRDF_Diffuse_Lambert( directLight, geometry, diffuse );

		#ifdef DOUBLE_SIDED

			float backDotNL = saturate( dot( -geometry.normal, directLight.direction ) );
			vLightBack += backDotNL * directLight.color * BRDF_Diffuse_Lambert( directLight, backGeometry, diffuse );

		#endif

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		IncidentLight directLight = getSpotDirectLight( spotLights[ i ], geometry );

		float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
		vLightFront += dotNL * directLight.color * BRDF_Diffuse_Lambert( directLight, geometry, diffuse );

		#ifdef DOUBLE_SIDED

			float backDotNL = saturate( dot( -geometry.normal, directLight.direction ) );
			vLightBack += backDotNL * directLight.color * BRDF_Diffuse_Lambert( directLight, backGeometry, diffuse );

		#endif
	}

#endif

#if MAX_DIR_LIGHTS > 0

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		IncidentLight directLight = getDirectionalDirectLight( directionalLights[ i ], geometry );

		float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
		vLightFront += dotNL * directLight.color * BRDF_Diffuse_Lambert( directLight, geometry, diffuse );

		#ifdef DOUBLE_SIDED

			float backDotNL = saturate( dot( -geometry.normal, directLight.direction ) );
			vLightBack += backDotNL * directLight.color * BRDF_Diffuse_Lambert( directLight, backGeometry, diffuse );

		#endif

	}

#endif

	{
	
		IncidentLight frontIndirectLight;
		frontIndirectLight.direction = geometry.normal;
		frontIndirectLight.color = ambientLightColor;

		#ifdef DOUBLE_SIDED
		
			IncidentLight backIndirectLight;
			backIndirectLight.direction = -geometry.normal;
			backIndirectLight.color = ambientLightColor;

		#endif

		#if MAX_HEMI_LIGHTS > 0

			for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

				frontIndirectLight.color += getHemisphereIndirectLight( hemisphereLights[ i ], geometry ).color;


				#ifdef DOUBLE_SIDED
			
					backIndirectLight.color += getHemisphereIndirectLight( hemisphereLights[ i ], backGeometry ).color;

				#endif

			}

		#endif

		float frontDotNL = saturate( dot( geometry.normal, frontIndirectLight.direction ) );
		vLightFront += frontDotNL * frontIndirectLight.color * BRDF_Diffuse_Lambert( frontIndirectLight, geometry, diffuse );

		#ifdef DOUBLE_SIDED

			float backDotNL = saturate( dot( -geometry.normal, backIndirectLight.direction ) );
			vLightBack += backDotNL * backIndirectLight.color * BRDF_Diffuse_Lambert( backIndirectLight, backGeometry, diffuse );

		#endif

	}