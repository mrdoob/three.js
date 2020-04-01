export default /* glsl */`
#ifdef USE_UV

	#ifdef USE_WORLD_UV

		vUv = ( uvTransform * vec3( worldPositionInitial.WORLD_MAPPING_U, worldPositionInitial.WORLD_MAPPING_V, 1 ) ).xy;

	#else

		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;

	#endif

#endif
`;
