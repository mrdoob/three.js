#ifdef USE_LIGHTMAP

	totalAmbientLight += texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;

#endif
