#ifdef USE_EMISSIVEMAP

	vec4 emissiveColor = texture2D( emissiveMap, vUv );

	emissiveColor.rgb = inputToLinear( emissiveColor.rgb );

	totalEmissiveLight *= emissiveColor.rgb;

#endif
