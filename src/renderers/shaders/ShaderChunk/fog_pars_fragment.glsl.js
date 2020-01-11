export default /* glsl */`
#ifdef USE_FOG

	uniform vec3 fogColor;
	varying vec3 vFogPosition;

	#if defined( FOG_EXP ) || defined( FOG_EXP2 )

		uniform float fogDensity;

	#else

		uniform float fogNear;
		uniform float fogFar;

	#endif

#endif
`;
