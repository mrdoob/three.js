export default /* glsl */`
#if defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )

	#if defined( USE_VERTEX_ALPHA )

		vColor = vec4( 1.0 );

	#else

		vColor = vec3( 1.0 );

	#endif

#endif

#ifdef USE_COLOR

	vColor *= color;

#endif

#ifdef USE_INSTANCING_COLOR

	vColor.xyz *= instanceColor.xyz;

#endif
`;
