export default /* glsl */`
#if defined( RE_IndirectDiffuse )

	#ifdef USE_LIGHTMAP

		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		vec3 lightMapIrradiance = lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity;

		#ifndef PHYSICALLY_CORRECT_LIGHTS

			lightMapIrradiance *= PI;

		#endif

		irradiance += lightMapIrradiance;

	#endif

	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )

		iblIrradiance += getIBLIrradiance( splitGeoNormal );

	#endif

#endif

#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )

	radiance += getIBLRadiance( geometry.viewDir, splitGeoNormal, material.roughness );

	#ifdef USE_CLEARCOAT

		clearcoatRadiance += getIBLRadiance( geometry.viewDir, splitGeoClearcoatNormal, material.clearcoatRoughness );

	#endif

#endif
`;
