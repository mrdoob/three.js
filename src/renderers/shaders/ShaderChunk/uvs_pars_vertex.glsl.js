export default /* glsl */`
#ifdef USE_UV

	#ifdef UVS_VERTEX_ONLY

		vec2 vUv[ 2 ];

	#else

		varying vec2 vUv[ 2 ];

	#endif

	uniform mat3 uvTransform;

#endif
#ifdef USE_UV2

	attribute vec2 uv2;

	uniform mat3 uv2Transform;

#endif
`;
