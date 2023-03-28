export default /* glsl */`
#ifdef USE_UV

	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;

#endif
#ifdef USE_UV2

	vUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;

#endif
`;
