#ifdef USE_SKINNING

	vec4 mvPosition = modelViewMatrix * skinned;

#elif defined( USE_MORPHTARGETS )

	vec4 mvPosition = modelViewMatrix * vec4( morphed, 1.0 );

#else

	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

#endif

gl_Position = projectionMatrix * mvPosition;
