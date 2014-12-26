#if defined( USE_ENVMAP ) || defined( PHONG ) || defined( LAMBERT ) || defined ( USE_SHADOWMAP ) || defined( USE_SHARED_MATERIAL )

	#ifdef USE_SHARED_MATERIAL

		vec4 worldPosition = sharedMaterialTransformMatrix * vec4( position, 1.0 );

	#elif defined( USE_SKINNING )

		vec4 worldPosition = modelMatrix * skinned;

	#elif defined( USE_MORPHTARGETS )

		vec4 worldPosition = modelMatrix * vec4( morphed, 1.0 );

	#else

		vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

	#endif

#endif
