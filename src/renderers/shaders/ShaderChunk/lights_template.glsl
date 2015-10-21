// Instructions for use:
//  - Ensure that both BRDF_Material_DirectLight and BRDF_Material_Indirect light are defined
//  - Create a material parameter that is to be passed as the third parameter to your lighting functions.

GeometricContext geometry = GeometricContext( -vViewPosition, normalize( normal ), normalize(vViewPosition ) );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		IncidentLight directLight = getPointDirectLight( pointLights[ i ], geometry );

		BRDF_Material_DirectLight( directLight, geometry, material, directReflectedLight );

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		IncidentLight directLight = getSpotDirectLight( spotLights[ i ], geometry );

		BRDF_Material_DirectLight( directLight, geometry, material, directReflectedLight );

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		IncidentLight directLight = getDirectionalDirectLight( directionalLights[ i ], geometry );

		BRDF_Material_DirectLight( directLight, geometry, material, directReflectedLight );
		
	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		IncidentLight indirectLight = getHemisphereIndirectLight( hemisphereLights[ i ], geometry );

		BRDF_Material_IndirectLight( indirectLight, geometry, material, indirectReflectedLight );

	}

#endif
