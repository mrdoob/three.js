#ifdef USE_FOG

	uniform vec3 fogColor;
#if defined(NEEDSGLSL300)
	in float fogDepth;
#else
	varying float fogDepth;
#endif

	#ifdef FOG_EXP2

		uniform float fogDensity;

	#else

		uniform float fogNear;
		uniform float fogFar;

	#endif

#endif
