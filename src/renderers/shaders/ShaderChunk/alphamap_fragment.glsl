#ifdef USE_ALPHAMAP

	gl_FragColor.a *= texture2D( alphaMap, vUv ).g;

#endif
