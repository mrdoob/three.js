export default /* glsl */`
#ifdef USE_FOG

	// Use distance for perspective camera, but only depth for orthographic camera:
	vFogPosition = vec3( isOrthographic ? vec2(0.) : mvPosition.xy, mvPosition.z );

#endif
`;
