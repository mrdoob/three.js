#ifdef USE_EMISSIVEMAP

	vec4 emissiveColor = texture2D( emissiveMap, vUv );

	emissiveColor.rgb = texelDecode( emissiveColor, emissiveMapEncoding ).rgb;

	totalEmissiveLight *= emissiveColor.rgb;

#endif
