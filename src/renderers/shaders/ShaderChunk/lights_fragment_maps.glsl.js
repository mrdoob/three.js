export default /* glsl */`
#if defined( RE_IndirectDiffuse )

	// this PR requires #13501, I think
	int maxMIPLevel = 8; // TODO: fix

	#ifdef USE_LIGHTMAP

		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;

		#ifndef PHYSICALLY_CORRECT_LIGHTS

			lightMapIrradiance *= PI;

		#endif

		irradiance += lightMapIrradiance;

	#endif

	#if defined( USE_ENVMAP ) && defined( STANDARD ) && ( defined( ENVMAP_TYPE_CUBE_UV ) || defined( ENVMAP_TYPE_CUBE ) )

		iblIrradiance += getIBLIrradiance( geometry.normal, maxMIPLevel );

	#endif

#endif

#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )

	radiance += getIBLRadiance( geometry.viewDir, geometry.normal, material.roughness, maxMIPLevel );

	#ifdef USE_CLEARCOAT

		clearcoatRadiance += getIBLRadiance( geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness, maxMIPLevel );

	#endif

#endif
`;
