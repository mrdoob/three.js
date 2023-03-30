export default /* glsl */`
#ifdef USE_FOG

	vFogPosition = mvPosition.xyz;
	// Consider only depth for orthographic camera:
	float projection_is_ortho = projectionMatrix[3][3];
	vFogPosition.xy -= projection_is_ortho * mvPosition.xy;

#endif
`;
