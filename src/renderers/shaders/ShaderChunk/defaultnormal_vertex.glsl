#ifdef USE_SKINNING

	vec3 objectNormal = skinnedNormal.xyz;

#elif defined( USE_MORPHNORMALS )

	vec3 objectNormal = morphedNormal;

#else

	vec3 objectNormal = normal;

#endif

#ifdef FLIP_SIDED

	objectNormal = -objectNormal;

#endif

vec3 transformedNormal = normalMatrix * objectNormal;
