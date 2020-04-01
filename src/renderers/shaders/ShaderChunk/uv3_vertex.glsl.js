export default /* glsl */`
#ifdef USE_WORLD_UV

	vUv3 = vec2( worldPosition.WORLD_MAPPING_U, worldPosition.WORLD_MAPPING_V );

#endif
`;
