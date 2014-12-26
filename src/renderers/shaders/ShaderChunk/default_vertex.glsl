vec4 mvPosition;

#if defined( USE_SKINNING ) && ! defined( USE_SHARED_MATERIAL )

	mvPosition = modelViewMatrix * skinned;

#endif

#if !defined( USE_SKINNING ) && defined( USE_MORPHTARGETS ) && ! defined( USE_SHARED_MATERIAL )

	mvPosition = modelViewMatrix * vec4( morphed, 1.0 );

#endif

#if !defined( USE_SKINNING ) && ! defined( USE_MORPHTARGETS ) && ! defined( USE_SHARED_MATERIAL )

	mvPosition = modelViewMatrix * vec4( position, 1.0 );

#endif

#if defined( USE_SHARED_MATERIAL )

	mvPosition = modelViewMatrix * sharedMaterialTransformMatrix * vec4( position, 1.0 );
	

#endif

gl_Position = projectionMatrix * mvPosition;