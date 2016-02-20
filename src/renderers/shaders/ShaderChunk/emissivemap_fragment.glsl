#ifdef USE_EMISSIVEMAP

	vec4 emissiveColor = texture2D( emissiveMap, vUv );

	emissiveColor.rgb = EncodingToLinear( emissiveColor, emissiveMapEncoding ).rgb;

	totalEmissiveLight *= emissiveColor.rgb;

#endif
