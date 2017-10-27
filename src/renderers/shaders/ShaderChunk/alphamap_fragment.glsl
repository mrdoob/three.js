#ifdef USE_ALPHAMAP

	diffuseColor.a *= texture2D( alphaMap, vUvAlpha ).g;

#endif
