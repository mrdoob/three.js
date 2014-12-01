#if defined( USE_ENVMAP ) || defined( PHONG ) || defined( LAMBERT ) || defined ( USE_SHADOWMAP )

	#ifdef USE_SKINNING && ! defined( USE_SHARED_MATERIAL )

		vec4 worldPosition = modelMatrix * skinned;

	#endif

	#if defined( USE_MORPHTARGETS ) && ! defined( USE_SKINNING ) && ! defined( USE_SHARED_MATERIAL )

		vec4 worldPosition = modelMatrix * vec4( morphed, 1.0 );

	#endif
	
	#if defined( USE_SHARED_MATERIAL )

		vec4 worldPosition = sharedMaterialTransformMatrix * vec4( position, 1.0 );
	
	#endif

	#if ! defined( USE_MORPHTARGETS ) && ! defined( USE_SKINNING ) && ! defined( USE_SHARED_MATERIAL )

		vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

	#endif

#endif