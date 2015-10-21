// Instructions for use:
//  - Ensure that both BRDF_Material_DirectLight and BRDF_Material_Indirect light are defined
//  - Create a material parameter that is to be passed as the third parameter to your lighting functions.

GeometricContext geometry = GeometricContext( -vViewPosition, normalize( normal ), normalize(vViewPosition ) );

#if ( MAX_POINT_LIGHTS > 0 ) && defined( BRDF_Material_DirectLight )

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		IncidentLight directLight = getPointDirectLight( pointLights[ i ], geometry );

		BRDF_Material_DirectLight( directLight, geometry, material, directReflectedLight );

	}

#endif

#if ( MAX_SPOT_LIGHTS > 0 ) && defined( BRDF_Material_DirectLight )

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		IncidentLight directLight = getSpotDirectLight( spotLights[ i ], geometry );

		BRDF_Material_DirectLight( directLight, geometry, material, directReflectedLight );

	}

#endif

#if ( MAX_DIR_LIGHTS > 0 ) && defined( BRDF_Material_DirectLight )

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		IncidentLight directLight = getDirectionalDirectLight( directionalLights[ i ], geometry );

		BRDF_Material_DirectLight( directLight, geometry, material, directReflectedLight );
		
	}

#endif

#if defined( BRDF_Material_DiffuseIndirectLight )

	{
	
		IncidentLight indirectLight;
		indirectLight.direction = geometry.normal;
		indirectLight.color = ambientLightColor;

#ifdef USE_LIGHTMAP

		indirectLight.color += texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;

#endif

#if ( MAX_HEMI_LIGHTS > 0 )

		for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

			indirectLight.color += getHemisphereIndirectLight( hemisphereLights[ i ], geometry ).color;

		}

#endif

		BRDF_Material_DiffuseIndirectLight( indirectLight, geometry, material, indirectReflectedLight );

	}

#endif

#if defined( ENV_MAP ) && defined( BRDF_Material_SpecularIndirectLight )

	{

		IncidentLight indirectLight = getSpecularLightProbeIndirectLight( specularLightProbe, geometry, Material_LightProbeLOD( material ) );

    	BRDF_Material_SpecularIndirectLight( lightProbeIncidentLight, geometry, material, indirectReflectedLight );

    }

#endif