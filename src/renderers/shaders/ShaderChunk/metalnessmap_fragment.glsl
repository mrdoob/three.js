float metalnessFactor = metalness;

#ifdef USE_METALNESSMAP

	vec4 texelMetalness = texture2D( metalnessMap, vUv );
	metalnessFactor = texelMetalness.r; // note equality, not *=

#endif
