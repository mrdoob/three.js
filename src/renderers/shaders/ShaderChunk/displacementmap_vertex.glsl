#ifdef USE_DISPLACEMENTMAP

	#ifdef USE_MORPHNORMALS

		transformed += morphNormal * ( texture2D( displacementMap, uv ).x * displacementScale + displacementBias );

	#else

		transformed += normal * ( texture2D( displacementMap, uv ).x * displacementScale + displacementBias );

	#endif


#endif
