export default /* glsl */`
#if defined ( USE_WORLD_UV )

	vec4 worldPositionInitial = vec4( position, 1.0 );

	#ifdef USE_INSTANCING

		worldPositionInitial = instanceMatrix * worldPositionInitial;

	#endif

	worldPositionInitial = modelMatrix * worldPositionInitial;

#endif
`;
