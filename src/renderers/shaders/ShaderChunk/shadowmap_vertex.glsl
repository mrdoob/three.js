#ifdef USE_SHADOWMAP

	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

		vDirectionalShadowCoord[ i ] = directionalLights[ i ].shadowMatrix * worldPosition;

	}

	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

		vSpotShadowCoord[ i ] = spotLights[ i ].shadowMatrix * worldPosition;

	}

	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

		vPointShadowCoord[ i ] = pointLights[ i ].shadowMatrix * worldPosition;

	}

#endif
