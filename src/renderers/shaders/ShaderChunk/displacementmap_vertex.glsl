#ifdef USE_DISPLACEMENTMAP

	float df = displacementScale * texture2D( displacementMap, uv2 ).r + displacementBias;
	vec3 displaced = position + normalize( normal ) * df; // original normal, I guess

#endif
