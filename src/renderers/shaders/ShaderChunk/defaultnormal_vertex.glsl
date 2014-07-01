vec3 objectNormal;

#ifdef USE_SKINNING

	objectNormal = skinnedNormal.xyz;

#endif

#if !defined( USE_SKINNING ) && defined( USE_MORPHNORMALS )

	objectNormal = morphedNormal;

#endif

#if !defined( USE_SKINNING ) && ! defined( USE_MORPHNORMALS )

	objectNormal = normal;

#endif

#ifdef FLIP_SIDED

	objectNormal = -objectNormal;

#endif

vec3 transformedNormal = normalMatrix * objectNormal;