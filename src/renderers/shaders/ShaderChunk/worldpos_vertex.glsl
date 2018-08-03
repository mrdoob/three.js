#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || NUM_SPOT_LIGHT_MAPS > 0

	vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );

#endif
