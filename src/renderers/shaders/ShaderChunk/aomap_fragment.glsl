#ifdef USE_AOMAP

	indirectReflectedLight.diffuse *= ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;

#endif
