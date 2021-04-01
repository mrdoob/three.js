export default /* glsl */`
float getShadowMask() {

	float shadow = 1.0;

	#ifdef USE_SHADOWMAP

	#if NUM_DIR_LIGHT_SHADOWS > 0

	DirectionalLightShadow directionalLight;

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {

		directionalLight = directionalLightShadows[ i ];

		#if defined( SHADOWMAP_TYPE_PCF )
		shadow *= receiveShadow ? getShadowPCF( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
		shadow *= receiveShadow ? getShadowPCFSoft( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, vDirectionalShadowCoord[ i ] ) : 1.0;
		#elif defined( SHADOWMAP_TYPE_VSM )
		shadow *= receiveShadow ? getShadowVSM( directionalShadowMap[ i ], directionalLight.shadowBias, vDirectionalShadowCoord[ i ] ) : 1.0;
		#else
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowBias, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif

	}
	#pragma unroll_loop_end

	#endif

	#if NUM_SPOT_LIGHT_SHADOWS > 0

	SpotLightShadow spotLight;

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {

		spotLight = spotLightShadows[ i ];

		#if defined( SHADOWMAP_TYPE_PCF )
		shadow *= receiveShadow ? getShadowPCF( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
		shadow *= receiveShadow ? getShadowPCFSoft( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, vSpotShadowCoord[ i ] ) : 1.0;
		#elif defined( SHADOWMAP_TYPE_VSM )
		shadow *= receiveShadow ? getShadowVSM( spotShadowMap[ i ], spotLight.shadowBias, vSpotShadowCoord[ i ] ) : 1.0;
		#else
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowBias, vSpotShadowCoord[ i ] ) : 1.0;
		#endif

	}
	#pragma unroll_loop_end

	#endif

	#if NUM_POINT_LIGHT_SHADOWS > 0

	PointLightShadow pointLight;

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {

		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;

	}
	#pragma unroll_loop_end

	#endif

	/*
	#if NUM_RECT_AREA_LIGHTS > 0

		// TODO (abelnation): update shadow for Area light

	#endif
	*/

	#endif

	return shadow;

}
`;
