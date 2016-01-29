#ifdef USE_SHADOWMAP

	#if NUM_DIR_LIGHTS > 0

		for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

			vDirectionalShadowCoord[ i ] = directionalLights[ i ].shadowMatrix * worldPosition;

		}

	#endif

	#if NUM_SPOT_LIGHTS > 0

		for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

			vSpotShadowCoord[ i ] = spotLights[ i ].shadowMatrix * worldPosition;

		}

	#endif

	#if NUM_POINT_LIGHTS > 0

		for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

			vPointShadowCoord[ i ] = pointLights[ i ].shadowMatrix * worldPosition;

		}

	#endif

#endif
