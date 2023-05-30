export default /* glsl */`
#if defined( USE_COLOR_ALPHA )

	#if defined( FLAT_COLORS )
		flat varying vec4 vColor;
	#else
		varying vec4 vColor;
	#endif

#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )

	#if defined( FLAT_COLORS )
		flat varying vec3 vColor;
	#else
		varying vec3 vColor;
	#endif

#endif
`;
