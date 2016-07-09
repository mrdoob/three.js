#ifdef USE_DISPLACEMENTMAP

	transformed += normal * ( texture2D( displacementMap, uv ).x * displacementScale + displacementBias );

#endif
