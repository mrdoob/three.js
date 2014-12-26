vec3 objectNormal;

#if defined( USE_SKINNING ) && !defined( USE_SHARED_MATERIAL )

	objectNormal = skinnedNormal.xyz;

#endif

#if !defined( USE_SKINNING ) && defined( USE_SHARED_MATERIAL )

	objectNormal = sharedMaterialNormal.xyz;

#endif

#if !defined( USE_SKINNING ) && !defined( USE_SHARED_MATERIAL ) && defined( USE_MORPHNORMALS )

	objectNormal = morphedNormal;

#endif

#if !defined( USE_SKINNING ) && !defined( USE_SHARED_MATERIAL ) && ! defined( USE_MORPHNORMALS )

	objectNormal = normal;

#endif

#ifdef FLIP_SIDED

	objectNormal = -objectNormal;

#endif


vec3 transformedNormal = normalMatrix * objectNormal;