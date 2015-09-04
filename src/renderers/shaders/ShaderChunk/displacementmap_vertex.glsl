#ifdef USE_DISPLACEMENTMAP

	transformed += objectNormal * texture2D( displacementMap, uv ).x * displacementScale;

#endif
