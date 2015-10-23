vec3 diffuse = vec3( 1.0 );

GeometricContext geometry = GeometricContext( mvPosition.xyz, normalize( transformedNormal ), normalize( -mvPosition.xyz ) );
GeometricContext backGeometry = GeometricContext( geometry.position, -geometry.normal, geometry.viewDir );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		IncidentLight directLight = getPointDirectLight( pointLights[ i ], geometry );

		float dotNL = dot( geometry.normal, directLight.direction );
		vec3 directLightColor_Diffuse = directLight.color * BRDF_Diffuse_Lambert( diffuse );

		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;

		#ifdef DOUBLE_SIDED

			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;

		#endif

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		IncidentLight directLight = getSpotDirectLight( spotLights[ i ], geometry );

		float dotNL = dot( geometry.normal, directLight.direction );
		vec3 directLightColor_Diffuse = directLight.color * BRDF_Diffuse_Lambert( diffuse );

		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;

		#ifdef DOUBLE_SIDED

			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;

		#endif
	}

#endif

#if MAX_DIR_LIGHTS > 0

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		IncidentLight directLight = getDirectionalDirectLight( directionalLights[ i ], geometry );

		float dotNL = dot( geometry.normal, directLight.direction );
		vec3 directLightColor_Diffuse = directLight.color * BRDF_Diffuse_Lambert( diffuse );

		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;

		#ifdef DOUBLE_SIDED

			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;

		#endif

	}

#endif

	{
		// dotNL is always one, and diffuseColor is vec3(1.0), thus the result is equivalent to summing indirectDiffuse lights
		//float frontDotNL = saturate( dot( geometry.normal, frontIndirectLight.direction ) );
		//vLightFront += frontDotNL * frontIndirectLight.color * BRDF_Diffuse_Lambert( diffuse );
		
		vLightFront += ambientLightColor;

		#ifdef DOUBLE_SIDED
		
			vLightBack += ambientLightColor;

		#endif

		#if MAX_HEMI_LIGHTS > 0

			for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

				vLightFront += getHemisphereIndirectLightColor( hemisphereLights[ i ], geometry );

				#ifdef DOUBLE_SIDED
			
					vLightBack += getHemisphereIndirectLightColor( hemisphereLights[ i ], backGeometry );

				#endif

			}

		#endif

	}