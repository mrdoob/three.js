export default /* glsl */`
#ifdef USE_UV

	vUv[ 0 ] = ( uvTransform * vec3( uv, 1 ) ).xy;

#endif
#ifdef USE_UV2

	vUv[ 1 ] = ( uvTransform * vec3( uv2, 1 ) ).xy;

#endif
`;
