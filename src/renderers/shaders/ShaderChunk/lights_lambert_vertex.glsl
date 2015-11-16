vec3 diffuse = vec3( 1.0 );

GeometricContext geometry;
geometry.position = mvPosition.xyz;
geometry.normal = normalize( transformedNormal );
geometry.viewDir = normalize( -mvPosition.xyz );

GeometricContext backGeometry;
backGeometry.position = geometry.position;
backGeometry.normal = -geometry.normal;
backGeometry.viewDir = geometry.viewDir;

vLightFront = vec3( 0.0 );

#ifdef DOUBLE_SIDED
	vLightBack = vec3( 0.0 );
#endif

#if NUM_POINT_LIGHTS > 0

	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

		IncidentLight directLight = getPointDirectIrradiance( pointLights[ i ], geometry );

		float dotNL = dot( geometry.normal, directLight.direction );
		vec3 directLightColor_Diffuse = PI * directLight.color;

		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;

		#ifdef DOUBLE_SIDED

			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;

		#endif

	}

#endif

#if NUM_SPOT_LIGHTS > 0

	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

		IncidentLight directLight = getSpotDirectIrradiance( spotLights[ i ], geometry );

		float dotNL = dot( geometry.normal, directLight.direction );
		vec3 directLightColor_Diffuse = PI * directLight.color;

		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;

		#ifdef DOUBLE_SIDED

			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;

		#endif
	}

#endif

#if NUM_DIR_LIGHTS > 0

	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

		IncidentLight directLight = getDirectionalDirectLight( directionalLights[ i ], geometry );

		float dotNL = dot( geometry.normal, directLight.direction );
		vec3 directLightColor_Diffuse = PI * directLight.color;

		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;

		#ifdef DOUBLE_SIDED

			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;

		#endif

	}

#endif

	{


		#if NUM_HEMI_LIGHTS > 0

			for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

				vLightFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );

				#ifdef DOUBLE_SIDED

					vLightBack += getHemisphereLightIrradiance( hemisphereLights[ i ], backGeometry );

				#endif

			}

		#endif

	}
