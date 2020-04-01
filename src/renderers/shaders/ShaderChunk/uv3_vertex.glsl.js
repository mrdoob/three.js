export default /* glsl */`
#ifdef USE_WORLD_UV

	vUv3 = ( uvTransform * vec3( worldPositionInitial.WORLD_MAPPING_U, worldPositionInitial.WORLD_MAPPING_V, 1 ) ).xy;

#endif
`;
