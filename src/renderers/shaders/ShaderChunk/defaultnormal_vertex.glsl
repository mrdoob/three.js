#ifdef FLIP_SIDED

	vec3 transformedNormal = - normalMatrix * objectNormal;

#else

	vec3 transformedNormal = normalMatrix * objectNormal;

#endif


