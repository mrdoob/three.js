#ifdef USE_LIGHTMAP

	gl_FragColor = gl_FragColor * texture2D( lightMap, vUv2 );

#endif