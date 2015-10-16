#if MAX_SPOT_LIGHTS > 0 || defined( USE_ENVMAP )

	varying vec3 vWorldPosition;

#endif

#if MAX_POINT_LIGHTS > 0

	uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];

#endif
