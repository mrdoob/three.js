export default /* glsl */`
#ifdef USE_COLOR

	#ifdef USE_VERTEX_ALPHA

		diffuseColor *= vColor;

	#else

		diffuseColor.rgb *= vColor;

	#endif

#endif
`;
