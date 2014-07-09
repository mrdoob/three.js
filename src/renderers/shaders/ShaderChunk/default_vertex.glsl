vec4 mvPosition;

#ifdef USE_SKINNING

	mvPosition = modelViewMatrix * skinned;

#endif

#if !defined( USE_SKINNING ) && defined( USE_MORPHTARGETS )

	mvPosition = modelViewMatrix * vec4( morphed, 1.0 );

#endif

#if !defined( USE_SKINNING ) && ! defined( USE_MORPHTARGETS )

	mvPosition = modelViewMatrix * vec4( position, 1.0 );

#endif

gl_Position = projectionMatrix * mvPosition;