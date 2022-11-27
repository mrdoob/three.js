export default /* glsl */`
float metalnessFactor = metalness;

#ifdef USE_METALNESSMAP

	#ifdef USE_OMRMAP
	vec4 texelMetalness = texture2D( occlusionMetalRoughnessMap, vUv );
	#else
	vec4 texelMetalness = texture2D( metalnessMap, vUv );
	#endif

	// reads channel B, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	metalnessFactor *= texelMetalness.b;

#endif
`;
