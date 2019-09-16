export default /* glsl */`
#if defined( RE_IndirectDiffuse )

	#ifdef USE_LIGHTMAP

		vec3 lightMapIrradiance = texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;

		#ifndef PHYSICALLY_CORRECT_LIGHTS

			lightMapIrradiance *= PI; // factor of PI should not be present; included here to prevent breakage

		#endif

		irradiance += lightMapIrradiance;

	#endif

	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )

		iblIrradiance += getLightProbeIndirectIrradiance( /*lightProbe,*/ geometry, maxMipLevel );

	#endif

#endif

#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )

	#ifdef ANISOTROPY

		vec3 bentNormal = getBentNormal(geometry, anisotropyFactor, roughnessFactor);

	#else

		vec3 bentNormal = geometry.normal;

	#endif

	radiance += getLightProbeIndirectRadiance( /*specularLightProbe,*/ geometry.viewDir, bentNormal, material.specularRoughness, maxMipLevel );

	#ifndef CLEARCOAT
		clearcoatRadiance += getLightProbeIndirectRadiance( /*specularLightProbe,*/ geometry.viewDir, geometry.clearcoatNormal, material.clearcoatNormal, maxMipLevel );
	#endif

#endif
`;
