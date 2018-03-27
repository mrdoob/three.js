#ifdef USE_ENVMAP

	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )
	#if defined(NEEDSGLSL300)
		out vec3 vWorldPosition;
	#else
		varying vec3 vWorldPosition;
	#endif

	#else

	#if defined(NEEDSGLSL300)
		out vec3 vReflect;
	#else
		varying vec3 vReflect;
	#endif
		uniform float refractionRatio;

	#endif

#endif
