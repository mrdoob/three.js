#ifdef USE_SKINNING

	vec4 mvPosition = modelViewMatrix * skinned;

#else

	vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );

#endif

gl_Position = projectionMatrix * mvPosition;
