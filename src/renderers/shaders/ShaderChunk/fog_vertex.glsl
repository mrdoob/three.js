#ifdef USE_FOG

	#ifdef USE_PRECISION_HIGHP

		vFogPosition = mvPosition.xyz;

	#else

		vFogDepth = -mvPosition.z;

	#endif

#endif
