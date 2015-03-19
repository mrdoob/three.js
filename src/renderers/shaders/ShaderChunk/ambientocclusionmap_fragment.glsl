#ifdef USE_AMBIENTOCCLUSIONMAP

	outgoingLight *= texture2D( ambientOcclusionMap, vUv2 ).xyz;

#endif