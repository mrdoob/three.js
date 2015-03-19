#ifdef USE_AMBIENTOCCLUSIONMAP

	outgoingLight *= ( texture2D( ambientOcclusionMap, vUv2 ).r - 1.0 ) * ambientOcclusionScale + 1.0;

#endif