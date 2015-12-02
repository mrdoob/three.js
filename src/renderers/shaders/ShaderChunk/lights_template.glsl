//
// This is a template that can be used to light a material, it uses pluggable RenderEquations (RE)
//   for specific lighting scenarios.
//
// Instructions for use:
//  - Ensure that both RE_Direct, RE_IndirectDiffuse and RE_IndirectSpecular are defined
//  - If you have defined an RE_IndirectSpecular, you need to also provide a Material_LightProbeLOD. <---- ???
//  - Create a material parameter that is to be passed as the third parameter to your lighting functions.
//
// TODO:
//  - Add area light support.
//  - Add sphere light support.
//  - Add diffuse light probe (irradiance cubemap) support.
//

GeometricContext geometry;

geometry.position = - vViewPosition;
geometry.normal = normal;
geometry.viewDir = normalize( vViewPosition );

#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )

	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

		PointLight pointLight = pointLights[ i ];

		IncidentLight directLight = getPointDirectLight( pointLight, geometry );

		#ifdef USE_SHADOWMAP
		if ( pointLight.shadow > - 1 ) {
			for ( int j = 0; j < NUM_SHADOWS; j ++ ) {
				if ( j == pointLight.shadow ) {
					directLight.color *= shadows[ j ];
				}
			}
		}
		#endif

		RE_Direct( directLight, geometry, material, reflectedLight );

	}

#endif

#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )

	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

		SpotLight spotLight = spotLights[ i ];

		IncidentLight directLight = getSpotDirectLight( spotLight, geometry );

		#ifdef USE_SHADOWMAP
		if ( spotLight.shadow > - 1 ) {
			for ( int j = 0; j < NUM_SHADOWS; j ++ ) {
				if ( j == spotLight.shadow ) {
					directLight.color *= shadows[ j ];
				}
			}
		}
		#endif

		RE_Direct( directLight, geometry, material, reflectedLight );

	}

#endif

#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )

	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

		DirectionalLight directionalLight = directionalLights[ i ];

		IncidentLight directLight = getDirectionalDirectLight( directionalLight, geometry );

		#ifdef USE_SHADOWMAP
		if ( directionalLight.shadow > - 1 ) {
			for ( int j = 0; j < NUM_SHADOWS; j ++ ) {
				if ( j == directionalLight.shadow ) {
					directLight.color *= shadows[ j ];
				}
			}
		}
		#endif

		RE_Direct( directLight, geometry, material, reflectedLight );

	}

#endif

#if defined( RE_IndirectDiffuse )

	{

		vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

		#ifdef USE_LIGHTMAP

			irradiance += PI * texture2D( lightMap, vUv2 ).xyz * lightMapIntensity; // factor of PI should not be present; included here to prevent breakage

		#endif

		#if ( NUM_HEMI_LIGHTS > 0 )

			for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

				irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );

			}

		#endif

		// #if defined( USE_ENVMAP ) && defined( STANDARD )

			// TODO, replace 8 with the real maxMIPLevel
			// irradiance += getLightProbeIndirectIrradiance( /*lightProbe,*/ geometry, 8 ); // comment out until seams are fixed

		// #endif

		RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );

	}

#endif

#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )

	{

		// TODO, replace 8 with the real maxMIPLevel
		vec3 radiance = getLightProbeIndirectRadiance( /*specularLightProbe,*/ geometry, Material_BlinnShininessExponent( material ), 8 );

		RE_IndirectSpecular( radiance, geometry, material, reflectedLight );

    }

#endif
