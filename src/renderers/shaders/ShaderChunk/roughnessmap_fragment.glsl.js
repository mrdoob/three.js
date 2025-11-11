export default /* glsl */`
float roughnessFactor = roughness;

#ifdef USE_ROUGHNESSMAP

	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );

	// reads channel G, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	roughnessFactor *= texelRoughness.g;

#endif

// Clamp for mobile fp16 safety - prevents division by near-zero in BRDF
roughnessFactor = clamp( roughnessFactor , 0.089, 1.0 );

`;
