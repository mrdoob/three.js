#ifdef USE_AOMAP

	reflectedLight.indirectDiffuse *= ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;

#endif
