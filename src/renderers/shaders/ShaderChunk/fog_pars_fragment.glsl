#ifdef USE_FOG

	uniform vec3 fogColor;

	#ifdef USE_PRECISION_HIGHP

		varying vec3 vFogPosition;

	#else

		varying float vFogDepth;

	#endif

	#ifdef FOG_EXP2

		uniform float fogDensity;

	#else

		uniform float fogNear;
		uniform float fogFar;

	#endif

#endif
