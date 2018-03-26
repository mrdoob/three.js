#ifdef USE_SHADOWMAP

	#if NUM_DIR_LIGHTS > 0

		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHTS ];
	#if defined(NEEDSGLSL300)
		out vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHTS ];
	#else
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHTS ];
	#endif

	#endif

	#if NUM_SPOT_LIGHTS > 0

		uniform mat4 spotShadowMatrix[ NUM_SPOT_LIGHTS ];
	#if defined(NEEDSGLSL300)
		out vec4 vSpotShadowCoord[ NUM_SPOT_LIGHTS ];
	#else
		varying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHTS ];
	#endif

	#endif

	#if NUM_POINT_LIGHTS > 0

		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHTS ];
	#if defined(NEEDSGLSL300)
		out vec4 vPointShadowCoord[ NUM_POINT_LIGHTS ];
	#else
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHTS ];
	#endif

	#endif

	/*
	#if NUM_RECT_AREA_LIGHTS > 0

		// TODO (abelnation): uniforms for area light shadows

	#endif
	*/

#endif
