//
// This is a template that can be used to light a material, it uses pluggable RenderEquations (RE)
//   for specific lighting scenarios.
//
// Instructions for use:
//  - Ensure that both Material_RE_DirectLight, Material_RE_IndirectDiffuseLight and Material_RE_IndirectSpecularLight are defined
//  - If you have defined a Material_RE_IndirectSpecularLight, you need to also provide a Material_LightProbeLOD.
//  - Create a material parameter that is to be passed as the third parameter to your lighting functions.
//
// TODO:
//  - Add area light support.
//  - Add sphere light support.
//  - Add diffuse light probe (irradiance cubemap) support.
//

GeometricContext geometry = GeometricContext( -vViewPosition, normalize( normal ), normalize(vViewPosition ) );

#if ( NUM_POINT_LIGHTS > 0 ) && defined( Material_RE_DirectLight )

	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

		PointLight pointLight = pointLights[ i ];

		IncidentLight directLight = getPointDirectLight( pointLights[ i ], geometry );

		#ifdef USE_SHADOWMAP
		if ( pointLight.shadow > - 1 ) {
			for ( int j = 0; j < NUM_SHADOWS; j ++ ) {
				if ( j == pointLight.shadow ) {
					directLight.color *= shadows[ j ];
				}
			}
		}
		#endif

		Material_RE_DirectLight( directLight, geometry, material, reflectedLight );

	}

#endif

#if ( NUM_SPOT_LIGHTS > 0 ) && defined( Material_RE_DirectLight )

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

		Material_RE_DirectLight( directLight, geometry, material, reflectedLight );

	}

#endif

#if ( NUM_DIR_LIGHTS > 0 ) && defined( Material_RE_DirectLight )

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

		Material_RE_DirectLight( directLight, geometry, material, reflectedLight );

	}

#endif

#if defined( Material_RE_IndirectDiffuseLight )

	{

		vec3 indirectDiffuseIrradiance = getAmbientLightIrradiance( ambientLightColor );

#ifdef USE_LIGHTMAP

		indirectDiffuseIrradiance += PI * texture2D( lightMap, vUv2 ).xyz * lightMapIntensity; // factor of PI should not be present; included here to prevent breakage

#endif

#if ( NUM_HEMI_LIGHTS > 0 )

		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

			indirectDiffuseIrradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );

		}

#endif

#if defined( USE_ENVMAP ) && defined( STANDARD )

		// TODO, replace 8 with the real maxMIPLevel
		indirectDiffuseIrradiance += getLightProbeIndirectIrradiance( /*lightProbe,*/ geometry, 8 );

#endif

		Material_RE_IndirectDiffuseLight( indirectDiffuseIrradiance, geometry, material, reflectedLight );

	}

#endif

#if defined( USE_ENVMAP ) && defined( Material_RE_IndirectSpecularLight )

	{

		// TODO, replace 8 with the real maxMIPLevel
		vec3 indirectSpecularRadiance = getLightProbeIndirectRadiance( /*specularLightProbe,*/ geometry, Material_BlinnShininessExponent( material ), 8 );

		Material_RE_IndirectSpecularLight( indirectSpecularRadiance, geometry, material, reflectedLight );

    }

#endif
