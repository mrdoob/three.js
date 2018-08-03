#ifdef USE_FOG

	uniform vec3 fogColor;
	varying vec3 fogPosition;

	#ifdef FOG_EXP2

		uniform float fogDensity;

	#else

		uniform float fogNear;
		uniform float fogFar;

	#endif

#endif
