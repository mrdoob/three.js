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

#if ( MAX_POINT_LIGHTS > 0 ) && defined( Material_RE_DirectLight )

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		IncidentLight directLight = getPointDirectLight( pointLights[ i ], geometry );

		Material_RE_DirectLight( directLight, geometry, material, reflectedLight );

	}

#endif

#if ( MAX_SPOT_LIGHTS > 0 ) && defined( Material_RE_DirectLight )

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		IncidentLight directLight = getSpotDirectLight( spotLights[ i ], geometry );

		Material_RE_DirectLight( directLight, geometry, material, reflectedLight );

	}

#endif

#if ( MAX_DIR_LIGHTS > 0 ) && defined( Material_RE_DirectLight )

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		IncidentLight directLight = getDirectionalDirectLight( directionalLights[ i ], geometry );

		Material_RE_DirectLight( directLight, geometry, material, reflectedLight );
		
	}

#endif

#if defined( Material_RE_IndirectDiffuseLight )

	{
	
		vec3 indirectDiffuseColor = ambientLightColor;

#ifdef USE_LIGHTMAP

		indirectDiffuseColor += texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;

#endif

#if ( MAX_HEMI_LIGHTS > 0 )

		for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

			indirectDiffuseColor += getHemisphereIndirectLightColor( hemisphereLights[ i ], geometry );

		}

#endif

		Material_RE_IndirectDiffuseLight( indirectDiffuseColor, geometry, material, reflectedLight );

	}

#endif

#if defined( USE_ENVMAP ) && defined( Material_RE_IndirectSpecularLight )

	{

		vec3 indirectSpecularColor = getSpecularLightProbeIndirectLightColor( /*specularLightProbe,*/ geometry, Material_BlinnShininessExponent( material ) );

		Material_RE_IndirectSpecularLight( indirectSpecularColor, geometry, material, reflectedLight );

    }

#endif