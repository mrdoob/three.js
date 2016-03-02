#ifdef USE_LIGHTMAP

#if defined( TEXTURE_SLOTS )
	vec2 lightUv = lightMapUV();
#else
	vec2 lightUv = vUv2;
#endif

	reflectedLight.indirectDiffuse += PI * emissiveMapTexelTransform( texture2D( lightMap, lightUv ) ).xyz; // factor of PI should not be present; included here to prevent breakage

#endif
