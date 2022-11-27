export default /* glsl */`
float roughnessFactor = roughness;

#ifdef USE_ROUGHNESSMAP

	#ifdef USE_OMRMAP
	vec4 texelRoughness = texture2D( occlusionMetalRoughnessMap, vUv );
	#else
	vec4 texelRoughness = texture2D( roughnessMap, vUv );
	#endif

	// reads channel G, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	roughnessFactor *= texelRoughness.g;

#endif
`;
