export default /* glsl */`
#if defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )

	#if defined( USE_VERTEX_ALPHA )

		varying vec4 vColor;

	#else

		varying vec3 vColor;

	#endif

#endif
`;
