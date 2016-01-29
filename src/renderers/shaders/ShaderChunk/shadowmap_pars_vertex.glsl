#ifdef USE_SHADOWMAP

	#if NUM_DIR_LIGHTS > 0

		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHTS ];

	#endif

	#if NUM_SPOT_LIGHTS > 0

		varying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHTS ];

	#endif

	#if NUM_POINT_LIGHTS > 0

		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHTS ];

	#endif

#endif
