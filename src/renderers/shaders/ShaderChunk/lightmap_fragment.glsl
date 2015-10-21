#ifdef USE_LIGHTMAP

	indirectReflectedLight.diffuse += texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;

#endif
