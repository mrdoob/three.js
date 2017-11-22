#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( PHYSICAL )

	vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );

#endif
