#ifdef USE_EMISSIVEMAP

#if defined( TEXTURE_SLOTS )
	vec2 emissiveUv = emissiveMapUV();
#else
	vec2 emissiveUv = vUv;
#endif

	vec4 emissiveColor = texture2D( emissiveMap, emissiveUv );

	emissiveColor.rgb = emissiveMapTexelTransform( emissiveMapTexelToLinear( emissiveColor ) ).rgb;

	totalEmissiveLight *= emissiveColor.rgb;

#endif
