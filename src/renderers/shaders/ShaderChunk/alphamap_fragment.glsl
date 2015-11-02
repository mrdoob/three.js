#ifdef USE_ALPHAMAP

	diffuseColor.a *= texture2D( alphaMap, vUv ).g;

#endif
